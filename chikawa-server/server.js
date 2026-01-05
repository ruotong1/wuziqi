const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chikawa-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'chikawa-refresh-secret-key-change-in-production';

// 火山引擎配置
const VOLCENGINE_ACCESS_KEY_ID = '6dd9debe-3acc-4fa4-bb1a-c1199c344941';
const VOLCENGINE_SECRET_ACCESS_KEY = process.env.VOLCENGINE_SECRET_KEY || 'TUdNMllqVTFNR1ppWXpreE5EWTVPVGhtTm1aaU1XVXlZVGcxTlRZNVlXVQ==';
const VOLCENGINE_API_BASE = 'https://api.volcengine.com';
const VOLCENGINE_SERVICE = 'videoark';
const VOLCENGINE_VERSION = '2024-01-01';
const VOLCENGINE_MODEL = 'ep-20251225173805-sr2cm'; // 视频生成模型

// 中间件
app.use(cors());
app.use(express.json());

// 内存存储（生产环境应使用数据库）
const users = [];
const videos = [];
const videoHistory = [];

// 生成 Token
function generateTokens(userId, username) {
  const accessToken = jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { userId, username },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}

// 火山引擎API签名函数
function signVolcengineRequest(accessKeyId, secretAccessKey, method, url, body, headers = {}) {
  const urlObj = new URL(url);
  const host = urlObj.host;
  const path = urlObj.pathname + urlObj.search;
  
  const now = new Date();
  const date = now.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const contentSha256 = crypto.createHash('sha256').update(body || '').digest('hex');
  
  const signedHeaders = 'host;x-content-sha256;x-date';
  
  const canonicalRequest = [
    method.toUpperCase(),
    path,
    '',
    `host:${host}`,
    `x-content-sha256:${contentSha256}`,
    `x-date:${date}`,
    '',
    signedHeaders,
    contentSha256
  ].join('\n');
  
  // 计算签名
  const kDate = crypto.createHmac('sha256', Buffer.from('VolcengineRequest', 'utf8'))
    .update(date.split('T')[0], 'utf8')
    .digest();
  
  const kRegion = crypto.createHmac('sha256', kDate)
    .update('cn-north-1', 'utf8')
    .digest();
  
  const kService = crypto.createHmac('sha256', kRegion)
    .update('videoark', 'utf8')
    .digest();
  
  const kSigning = crypto.createHmac('sha256', kService)
    .update('request', 'utf8')
    .digest();
  
  const signature = crypto.createHmac('sha256', kSigning)
    .update(canonicalRequest, 'utf8')
    .digest('hex');
  
  return {
    'Authorization': `HMAC-SHA256 Credential=${accessKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    'Content-Type': 'application/json',
    'x-content-sha256': contentSha256,
    'x-date': date,
    ...headers
  };
}

// 调用火山引擎API
function callVolcengineAPI(action, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `${VOLCENGINE_API_BASE}/apigw?service=${VOLCENGINE_SERVICE}&version=${VOLCENGINE_VERSION}&action=${action}`;
    const body = JSON.stringify(params);
    const method = 'POST';
    
    const headers = signVolcengineRequest(
      VOLCENGINE_ACCESS_KEY_ID,
      VOLCENGINE_SECRET_ACCESS_KEY,
      method,
      url,
      body
    );
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            // 详细记录错误信息
            console.error(`火山引擎API错误 [${res.statusCode}]:`, JSON.stringify(jsonData, null, 2));
            const errorMsg = jsonData.ResponseMetadata?.Error?.Message || jsonData.Error?.Message || JSON.stringify(jsonData);
            const errorCode = jsonData.ResponseMetadata?.Error?.Code || jsonData.Error?.Code || 'UNKNOWN_ERROR';
            
            // 如果是403错误，提供更详细的错误信息
            if (res.statusCode === 403) {
              reject(new Error(`火山引擎API权限错误(403): ${errorCode} - ${errorMsg}. 请检查Access Key ID和Secret Key是否正确，以及是否有调用该API的权限`));
            } else {
              reject(new Error(`火山引擎API错误(${res.statusCode}): ${errorCode} - ${errorMsg}`));
            }
          }
        } catch (e) {
          console.error('解析火山引擎响应失败:', data);
          reject(new Error(`Parse Error: ${e.message} - ${data}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

// 验证 Token 中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未提供访问令牌'
      }
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: '访问令牌无效或已过期'
        }
      });
    }
    req.user = user;
    next();
  });
}

// 1. 用户注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 验证用户名
    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: '用户名长度必须在3-20个字符之间'
        }
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: '用户名只能包含字母、数字、下划线'
        }
      });
    }

    // 验证密码
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: '密码长度至少8个字符'
        }
      });
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: '密码必须包含至少一个字母和一个数字'
        }
      });
    }

    // 验证邮箱（如果提供）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: '邮箱格式无效'
        }
      });
    }

    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: '用户名已存在'
        }
      });
    }

    // 创建用户
    const userId = `user_${uuidv4()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      userId,
      username,
      password: hashedPassword,
      email: email || null,
      createdAt: new Date().toISOString()
    };
    users.push(user);

    // 生成 Token
    const { accessToken, refreshToken } = generateTokens(userId, username);

    res.status(201).json({
      success: true,
      data: {
        userId,
        username,
        accessToken,
        refreshToken,
        expiresIn: 3600
      },
      message: '注册成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 2. 用户登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: '用户名和密码不能为空'
        }
      });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.userId, user.username);

    res.json({
      success: true,
      data: {
        userId: user.userId,
        username: user.username,
        accessToken,
        refreshToken,
        expiresIn: 3600
      },
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 3. Token刷新接口
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: '未提供刷新令牌'
        }
      });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: '刷新令牌无效或已过期'
          }
        });
      }

      const { accessToken } = generateTokens(decoded.userId, decoded.username);

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 3600
        },
        message: 'Token刷新成功'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 4. 生成视频接口（对接火山引擎）
app.post('/api/video/generate', authenticateToken, async (req, res) => {
  try {
    const { keywords, mode = 'async' } = req.body;

    // 验证关键字
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_KEYWORDS',
          message: '关键字不能为空，且必须是数组格式'
        }
      });
    }

    if (keywords.length > 3) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_KEYWORDS',
          message: '关键字数量不能超过3个'
        }
      });
    }

    // 验证关键字格式
    for (const keyword of keywords) {
      if (typeof keyword !== 'string' || keyword.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_KEYWORD_FORMAT',
            message: '关键字必须是非空字符串'
          }
        });
      }
    }

    // 将关键字组合成Prompt（Chikawa风格描述）
    const prompt = `Chikawa风格的视频，主题：${keywords.join('、')}，可爱温馨，柔和色彩，简洁动画`;

    // 调用火山引擎API创建视频生成任务
    try {
      const volcengineParams = {
        Model: VOLCENGINE_MODEL,
        Prompt: prompt,
        Resolution: '1080p',
        Duration: 10,
        Watermark: false,
        CameraFixed: true
      };

      const volcengineResponse = await callVolcengineAPI('CreateContentsGenerationsTasks', volcengineParams);
      
      // 获取火山引擎返回的TaskId
      const volcengineTaskId = volcengineResponse.Result?.TaskId;
      
      if (!volcengineTaskId) {
        throw new Error('火山引擎未返回TaskId');
      }

      const taskId = uuidv4(); // 本地任务ID
      const videoId = `video_${uuidv4()}`;

      // 创建视频任务（保存火山引擎TaskId）
      const videoTask = {
        taskId,
        videoId,
        volcengineTaskId, // 火山引擎的任务ID
        userId: req.user.userId,
        keywords,
        prompt,
        mode,
        status: 'pending', // pending/processing/completed/failed
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      videos.push(videoTask);

      // 启动后台任务，定期查询火山引擎任务状态
      checkVolcengineTaskStatus(volcengineTaskId, taskId);

      res.json({
        success: true,
        data: {
          taskId,
          mode: 'async',
          message: '视频生成任务已提交到火山引擎'
        },
        message: '任务提交成功'
      });
    } catch (volcengineError) {
      console.error('火山引擎API调用失败:', volcengineError);
      
      // 如果是403错误，返回403状态码
      const is403Error = volcengineError.message.includes('403') || volcengineError.message.includes('权限');
      const statusCode = is403Error ? 403 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: {
          code: is403Error ? 'FORBIDDEN' : 'VOLCENGINE_API_ERROR',
          message: volcengineError.message || '火山引擎API调用失败'
        }
      });
    }
  } catch (error) {
    console.error('生成视频接口错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 后台任务：定期查询火山引擎任务状态
async function checkVolcengineTaskStatus(volcengineTaskId, localTaskId) {
  const maxAttempts = 60; // 最多查询60次（约3分钟）
  let attempts = 0;

  const checkStatus = async () => {
    attempts++;
    
    try {
      // 调用火山引擎查询任务状态API
      const response = await callVolcengineAPI('GetContentsGenerationsTask', {
        TaskId: volcengineTaskId
      });

      const result = response.Result;
      const status = result?.Status;
      const videoUrl = result?.VideoUrl;

      // 更新本地任务状态
      const task = videos.find(v => v.taskId === localTaskId);
      if (!task) {
        return; // 任务不存在，停止查询
      }

      if (status === 'Success' && videoUrl) {
        // 任务完成
        task.status = 'completed';
        task.progress = 100;
        task.videoUrl = videoUrl;
        task.updatedAt = new Date().toISOString();

        // 添加到历史记录
        videoHistory.push({
          historyId: `history_${uuidv4()}`,
          videoId: task.videoId,
          taskId: task.taskId,
          userId: task.userId,
          keywords: task.keywords,
          videoUrl: videoUrl,
          createdAt: task.createdAt
        });
      } else if (status === 'Failed') {
        // 任务失败
        task.status = 'failed';
        task.updatedAt = new Date().toISOString();
      } else if (status === 'Processing' || status === 'Pending') {
        // 任务进行中，更新进度
        task.status = 'processing';
        task.progress = result?.Progress || Math.min(attempts * 2, 90); // 估算进度
        task.updatedAt = new Date().toISOString();
        
        // 继续查询
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000); // 3秒后再次查询
        }
      }
    } catch (error) {
      console.error('查询火山引擎任务状态失败:', error);
      // 继续尝试
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 5000); // 5秒后重试
      } else {
        // 达到最大尝试次数，标记为失败
        const task = videos.find(v => v.taskId === localTaskId);
        if (task) {
          task.status = 'failed';
          task.updatedAt = new Date().toISOString();
        }
      }
    }
  };

  // 首次查询延迟3秒
  setTimeout(checkStatus, 3000);
}

// 5. 查询状态接口（支持查询火山引擎任务状态）
app.get('/api/video/status/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = videos.find(v => v.taskId === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TASK_NOT_FOUND',
          message: '任务不存在'
        }
      });
    }

    // 检查权限
    if (task.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权访问此任务'
        }
      });
    }

    // 如果任务还在进行中，尝试从火山引擎获取最新状态
    if (task.status === 'pending' || task.status === 'processing') {
      if (task.volcengineTaskId) {
        try {
          const volcengineResponse = await callVolcengineAPI('GetContentsGenerationsTask', {
            TaskId: task.volcengineTaskId
          });

          const result = volcengineResponse.Result;
          const status = result?.Status;
          const videoUrl = result?.VideoUrl;

          if (status === 'Success' && videoUrl) {
            task.status = 'completed';
            task.progress = 100;
            task.videoUrl = videoUrl;
            task.updatedAt = new Date().toISOString();

            // 添加到历史记录（如果还没有）
            const existingHistory = videoHistory.find(h => h.taskId === taskId);
            if (!existingHistory) {
              videoHistory.push({
                historyId: `history_${uuidv4()}`,
                videoId: task.videoId,
                taskId: task.taskId,
                userId: task.userId,
                keywords: task.keywords,
                videoUrl: videoUrl,
                createdAt: task.createdAt
              });
            }
          } else if (status === 'Failed') {
            task.status = 'failed';
            task.updatedAt = new Date().toISOString();
          } else if (status === 'Processing' || status === 'Pending') {
            task.status = 'processing';
            task.progress = result?.Progress || task.progress;
            task.updatedAt = new Date().toISOString();
          }
        } catch (error) {
          console.error('查询火山引擎任务状态失败:', error);
          // 继续返回本地状态
        }
      }
    }

    res.json({
      success: true,
      data: {
        taskId: task.taskId,
        videoId: task.videoId,
        status: task.status,
        progress: task.progress,
        keywords: task.keywords,
        videoUrl: task.videoUrl || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      },
      message: '查询成功'
    });
  } catch (error) {
    console.error('查询状态接口错误:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 6. 获取历史记录接口
app.get('/api/video/history', authenticateToken, (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const userHistory = videoHistory
      .filter(h => h.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (parseInt(page) - 1) * parseInt(pageSize);
    const end = start + parseInt(pageSize);
    const paginatedHistory = userHistory.slice(start, end);

    res.json({
      success: true,
      data: {
        history: paginatedHistory.map(h => ({
          historyId: h.historyId,
          videoId: h.videoId,
          taskId: h.taskId,
          keywords: h.keywords,
          videoUrl: h.videoUrl,
          createdAt: h.createdAt
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: userHistory.length,
          totalPages: Math.ceil(userHistory.length / parseInt(pageSize))
        }
      },
      message: '查询成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 7. 删除单个历史记录接口
app.delete('/api/video/history/:historyId', authenticateToken, (req, res) => {
  try {
    const { historyId } = req.params;
    const index = videoHistory.findIndex(
      h => h.historyId === historyId && h.userId === req.user.userId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HISTORY_NOT_FOUND',
          message: '历史记录不存在'
        }
      });
    }

    videoHistory.splice(index, 1);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 8. 清空所有历史记录接口
app.delete('/api/video/history/clear', authenticateToken, (req, res) => {
  try {
    const userHistoryCount = videoHistory.filter(h => h.userId === req.user.userId).length;
    
    // 删除该用户的所有历史记录
    for (let i = videoHistory.length - 1; i >= 0; i--) {
      if (videoHistory[i].userId === req.user.userId) {
        videoHistory.splice(i, 1);
      }
    }

    res.json({
      success: true,
      data: {
        deletedCount: userHistoryCount
      },
      message: '清空成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误'
      }
    });
  }
});

// 根路径 - 返回服务信息
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chikawa 视频生成器 API 服务</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          max-width: 800px;
          width: 100%;
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 2.5em;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 1.1em;
        }
        .status {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          margin-bottom: 30px;
        }
        .api-list {
          margin-top: 30px;
        }
        .api-item {
          background: #f8f9fa;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .method {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85em;
          margin-right: 10px;
        }
        .method.post { background: #10b981; color: white; }
        .method.get { background: #3b82f6; color: white; }
        .method.delete { background: #ef4444; color: white; }
        .endpoint {
          font-family: 'Courier New', monospace;
          color: #333;
          font-weight: 500;
        }
        .description {
          color: #666;
          margin-top: 5px;
          font-size: 0.9em;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #999;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎬 Chikawa 视频生成器</h1>
        <p class="subtitle">API 服务已成功启动</p>
        <span class="status">● 运行中</span>
        
        <div class="api-list">
          <h2 style="margin-bottom: 20px; color: #333;">可用接口</h2>
          
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/register</span>
            <div class="description">用户注册</div>
          </div>
          
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/login</span>
            <div class="description">用户登录</div>
          </div>
          
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/auth/refresh</span>
            <div class="description">Token 刷新</div>
          </div>
          
          <div class="api-item">
            <span class="method post">POST</span>
            <span class="endpoint">/api/video/generate</span>
            <div class="description">生成视频（需要认证）</div>
          </div>
          
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/video/status/:taskId</span>
            <div class="description">查询视频生成状态（需要认证）</div>
          </div>
          
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/api/video/history</span>
            <div class="description">获取视频历史记录（需要认证）</div>
          </div>
          
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">/api/video/history/:historyId</span>
            <div class="description">删除单个历史记录（需要认证）</div>
          </div>
          
          <div class="api-item">
            <span class="method delete">DELETE</span>
            <span class="endpoint">/api/video/history/clear</span>
            <div class="description">清空所有历史记录（需要认证）</div>
          </div>
          
          <div class="api-item">
            <span class="method get">GET</span>
            <span class="endpoint">/health</span>
            <div class="description">健康检查</div>
          </div>
        </div>
        
        <div class="footer">
          <p>服务运行在: <strong>http://localhost:${PORT}</strong></p>
          <p style="margin-top: 10px;">详细 API 文档请参考项目中的 API接口文档.md</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Chikawa 服务已启动！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`📚 API 文档: http://localhost:${PORT}/health`);
  console.log(`\n可用接口:`);
  console.log(`  POST   /api/auth/register - 用户注册`);
  console.log(`  POST   /api/auth/login - 用户登录`);
  console.log(`  POST   /api/auth/refresh - Token刷新`);
  console.log(`  POST   /api/video/generate - 生成视频`);
  console.log(`  GET    /api/video/status/:taskId - 查询状态`);
  console.log(`  GET    /api/video/history - 获取历史`);
  console.log(`  DELETE /api/video/history/:historyId - 删除历史`);
  console.log(`  DELETE /api/video/history/clear - 清空历史`);
});

