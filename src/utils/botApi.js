// Bot API 工具函数

// 获取API基础URL
export const getApiBaseUrl = () => {
  // 根据实际API地址修改，可以从环境变量或配置中获取
  return localStorage.getItem('bot_api_base_url') || 'https://api.6pen.art'
}

// 获取API token
export const getApiToken = () => {
  return localStorage.getItem('bot_api_token') || ''
}

// 搜索bot列表
export const searchBots = async (keyword = '', page = 1, pageSize = 20) => {
  try {
    const API_BASE_URL = getApiBaseUrl()
    const API_TOKEN = getApiToken()
    
    // 尝试不同的搜索端点
    const searchUrl = keyword 
      ? `${API_BASE_URL}/bots/search?keyword=${encodeURIComponent(keyword)}&page=${page}&page_size=${pageSize}`
      : `${API_BASE_URL}/bots?page=${page}&page_size=${pageSize}`
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`搜索失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('搜索bot列表失败:', error)
    throw error
  }
}

// 获取bot详情
export const getBotDetail = async (botId) => {
  try {
    const API_BASE_URL = getApiBaseUrl()
    const API_TOKEN = getApiToken()
    
    const response = await fetch(`${API_BASE_URL}/bots/${botId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`获取bot详情失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取bot详情失败:', error)
    throw error
  }
}

// 发送消息给bot（聊天）
export const sendMessageToBot = async (botId, message, parentId = null) => {
  try {
    const API_BASE_URL = getApiBaseUrl()
    const API_TOKEN = getApiToken()
    
    // 尝试不同的聊天端点
    const chatUrl = `${API_BASE_URL}/bots/${botId}/chat`
    
    const requestBody = {
      message: message
    }
    
    if (parentId) {
      requestBody.parent_id = parentId
    }
    
    const response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      throw new Error(`发送消息失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('发送消息失败:', error)
    throw error
  }
}

// 设置API token
export const setApiToken = (token) => {
  localStorage.setItem('bot_api_token', token)
}

// 设置API基础URL
export const setApiBaseUrl = (url) => {
  localStorage.setItem('bot_api_base_url', url)
}

