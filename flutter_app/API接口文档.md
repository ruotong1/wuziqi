# Chikawa视频生成器 - API接口文档

## 基础信息

- **API基础地址**: `YOUR_API_BASE_URL` (需要替换为实际地址)
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token (JWT)

---

## 认证说明

### Token获取
用户登录成功后，服务器会返回 `accessToken` 和 `refreshToken`。后续所有需要认证的接口都需要在请求头中携带 `accessToken`。

### 请求头格式
```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Token刷新
当 `accessToken` 过期时，使用 `refreshToken` 调用刷新接口获取新的 `accessToken`。

---

## 接口总览

| 序号 | 接口名称 | 方法 | 路径 | 认证 | 说明 |
|------|---------|------|------|------|------|
| 1 | 用户注册 | POST | `/api/auth/register` | 否 | 注册新用户账号 |
| 2 | 用户登录 | POST | `/api/auth/login` | 否 | 用户登录获取Token |
| 3 | Token刷新 | POST | `/api/auth/refresh` | 否 | 刷新访问令牌 |
| 4 | 生成视频 | POST | `/api/video/generate` | 是 | 根据关键字生成视频 |
| 5 | 查询状态 | GET | `/api/video/status/{taskId}` | 是 | 查询视频生成状态 |
| 6 | 获取历史 | GET | `/api/video/history` | 是 | 获取视频历史记录 |
| 7 | 删除历史 | DELETE | `/api/video/history/{historyId}` | 是 | 删除单个历史记录 |
| 8 | 清空历史 | DELETE | `/api/video/history/clear` | 是 | 清空所有历史记录 |

---

## 接口列表

### 1. 用户注册接口

用户注册新账号。

#### 接口信息

- **URL**: `/api/auth/register`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **认证**: 不需要

#### 请求参数

**请求体 (JSON)**:

```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | String | 是 | 用户名，3-20个字符，只能包含字母、数字、下划线 | `"user123"` |
| password | String | 是 | 密码，至少8个字符，包含字母和数字 | `"password123"` |
| email | String | 否 | 邮箱地址（可选） | `"user@example.com"` |

**参数验证规则**:
- `username` 长度必须在 3-20 之间
- `username` 只能包含字母、数字、下划线
- `password` 长度至少 8 个字符
- `password` 必须包含至少一个字母和一个数字
- `email` 如果提供，必须是有效的邮箱格式

#### 响应格式

**成功响应 (HTTP 201 Created)**:

```json
{
  "success": true,
  "data": {
    "userId": "user_123456789",
    "username": "user123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "注册成功"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.userId | String | 用户ID | `"user_123456789"` |
| data.username | String | 用户名 | `"user123"` |
| data.accessToken | String | 访问令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.refreshToken | String | 刷新令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.expiresIn | Number | Token有效期（秒） | `3600` |
| message | String | 响应消息 | `"注册成功"` |

**错误响应 (HTTP 400)**:

```json
{
  "success": false,
  "error": {
    "code": "USERNAME_EXISTS",
    "message": "用户名已存在",
    "details": {}
  }
}
```

**错误码说明**:

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| USERNAME_EXISTS | 400 | 用户名已存在 |
| INVALID_USERNAME | 400 | 用户名格式无效 |
| INVALID_PASSWORD | 400 | 密码格式无效 |
| INVALID_EMAIL | 400 | 邮箱格式无效 |

---

### 2. 用户登录接口

用户登录获取访问令牌。

#### 接口信息

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **认证**: 不需要

#### 请求参数

**请求体 (JSON)**:

```json
{
  "username": "user123",
  "password": "password123"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| username | String | 是 | 用户名 | `"user123"` |
| password | String | 是 | 密码 | `"password123"` |

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "userId": "user_123456789",
    "username": "user123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "登录成功"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.userId | String | 用户ID | `"user_123456789"` |
| data.username | String | 用户名 | `"user123"` |
| data.accessToken | String | 访问令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.refreshToken | String | 刷新令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.expiresIn | Number | Token有效期（秒） | `3600` |
| message | String | 响应消息 | `"登录成功"` |

**错误响应 (HTTP 401)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误",
    "details": {}
  }
}
```

**错误码说明**:

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| USER_NOT_FOUND | 401 | 用户不存在 |
| ACCOUNT_LOCKED | 403 | 账号已被锁定 |

---

### 3. Token刷新接口

使用刷新令牌获取新的访问令牌。

#### 接口信息

- **URL**: `/api/auth/refresh`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **认证**: 不需要（使用refreshToken）

#### 请求参数

**请求体 (JSON)**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| refreshToken | String | 是 | 刷新令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Token刷新成功"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.accessToken | String | 新的访问令牌 | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.refreshToken | String | 新的刷新令牌（可选） | `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."` |
| data.expiresIn | Number | Token有效期（秒） | `3600` |
| message | String | 响应消息 | `"Token刷新成功"` |

**错误响应 (HTTP 401)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "刷新令牌无效或已过期",
    "details": {}
  }
}
```

---

### 4. 生成视频接口

根据用户输入的关键字生成chikawa风格视频。

#### 接口信息

- **URL**: `/api/video/generate`
- **方法**: `POST`
- **Content-Type**: `application/json`
- **认证**: 需要（Bearer Token）

#### 请求参数

**请求体 (JSON)**:

```json
{
  "keywords": ["关键字1", "关键字2", "关键字3"],
  "style": "chikawa",
  "format": "mp4"
}
```

**参数说明**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| keywords | Array<String> | 是 | 关键字数组，1-3个元素，每个元素为字符串 | `["可爱", "粉色", "猫咪"]` |
| style | String | 是 | 视频风格，固定值为 "chikawa" | `"chikawa"` |
| format | String | 否 | 视频格式，默认为 "mp4" | `"mp4"` |

**参数验证规则**:
- `keywords` 数组长度必须在 1-3 之间
- `keywords` 中的每个元素不能为空字符串
- `keywords` 中的每个元素去除首尾空格后长度必须大于0

#### 响应格式

**方案A: 同步模式（快速生成，直接返回视频URL）**

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "videoUrl": "https://example.com/videos/abc123.mp4",
    "taskId": "task_123456789",
    "duration": 15,
    "thumbnail": "https://example.com/thumbnails/abc123.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "视频生成成功"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.videoUrl | String | 视频文件的完整URL地址 | `"https://example.com/videos/abc123.mp4"` |
| data.taskId | String | 任务ID（可选，用于后续查询） | `"task_123456789"` |
| data.duration | Number | 视频时长（秒） | `15` |
| data.thumbnail | String | 视频缩略图URL（可选） | `"https://example.com/thumbnails/abc123.jpg"` |
| data.createdAt | String | 创建时间（ISO 8601格式） | `"2024-01-15T10:30:00Z"` |
| message | String | 响应消息 | `"视频生成成功"` |

**方案B: 异步模式（长时间生成，返回任务ID）**

**成功响应 (HTTP 202 Accepted)**:

```json
{
  "success": true,
  "data": {
    "taskId": "task_123456789",
    "status": "processing",
    "estimatedTime": 60,
    "message": "视频生成任务已提交，预计60秒完成"
  },
  "message": "任务已提交"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.taskId | String | 任务ID，用于查询状态 | `"task_123456789"` |
| data.status | String | 任务状态：processing/completed/failed | `"processing"` |
| data.estimatedTime | Number | 预计完成时间（秒） | `60` |
| data.message | String | 状态消息 | `"视频生成任务已提交"` |
| message | String | 响应消息 | `"任务已提交"` |

**错误响应 (HTTP 400/500)**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_KEYWORDS",
    "message": "关键字数量必须在1-3个之间",
    "details": {}
  }
}
```

**错误码说明**:

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| INVALID_KEYWORDS | 400 | 关键字参数无效（数量、格式等） |
| KEYWORD_EMPTY | 400 | 关键字为空 |
| GENERATION_FAILED | 500 | 视频生成失败 |
| SERVICE_UNAVAILABLE | 503 | 服务暂时不可用 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率过高 |

---

### 5. 查询生成状态接口（异步模式使用）

查询视频生成任务的状态。

#### 接口信息

- **URL**: `/api/video/status/{taskId}`
- **方法**: `GET`
- **参数**: 路径参数 `taskId`
- **认证**: 需要（Bearer Token）

#### 请求参数

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| taskId | String | 是 | 任务ID | `"task_123456789"` |

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "taskId": "task_123456789",
    "status": "completed",
    "progress": 100,
    "videoUrl": "https://example.com/videos/abc123.mp4",
    "duration": 15,
    "thumbnail": "https://example.com/thumbnails/abc123.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:31:00Z",
    "message": "视频生成完成"
  }
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 可能值 |
|--------|------|------|--------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.taskId | String | 任务ID | - |
| data.status | String | 任务状态 | `"pending"`, `"processing"`, `"completed"`, `"failed"` |
| data.progress | Number | 生成进度（0-100） | `0-100` |
| data.videoUrl | String | 视频URL（仅status为completed时存在） | - |
| data.duration | Number | 视频时长（秒，仅status为completed时存在） | - |
| data.thumbnail | String | 缩略图URL（可选） | - |
| data.createdAt | String | 创建时间 | ISO 8601格式 |
| data.completedAt | String | 完成时间（仅status为completed时存在） | ISO 8601格式 |
| data.message | String | 状态消息 | - |

**状态值说明**:

- `pending`: 任务已提交，等待处理
- `processing`: 正在生成视频
- `completed`: 视频生成完成
- `failed`: 视频生成失败

**错误响应 (HTTP 404)**:

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "任务不存在或已过期",
    "details": {}
  }
}
```

---

### 6. 获取视频历史记录接口

获取当前用户的所有视频生成历史记录。

#### 接口信息

- **URL**: `/api/video/history`
- **方法**: `GET`
- **认证**: 需要（Bearer Token）

#### 请求参数

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| page | Number | 否 | 页码，从1开始，默认为1 | `1` |
| pageSize | Number | 否 | 每页数量，默认为20，最大100 | `20` |
| sort | String | 否 | 排序方式：`createdAt_desc`（默认，最新在前）或 `createdAt_asc`（最旧在前） | `"createdAt_desc"` |

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": "history_123456789",
        "taskId": "task_123456789",
        "keywords": ["可爱", "粉色", "猫咪"],
        "videoUrl": "https://example.com/videos/abc123.mp4",
        "thumbnail": "https://example.com/thumbnails/abc123.jpg",
        "duration": 15,
        "createdAt": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "获取成功"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.list | Array | 历史记录列表 | - |
| data.list[].id | String | 历史记录ID | `"history_123456789"` |
| data.list[].taskId | String | 任务ID | `"task_123456789"` |
| data.list[].keywords | Array<String> | 关键字数组 | `["可爱", "粉色", "猫咪"]` |
| data.list[].videoUrl | String | 视频URL | `"https://example.com/videos/abc123.mp4"` |
| data.list[].thumbnail | String | 缩略图URL（可选） | `"https://example.com/thumbnails/abc123.jpg"` |
| data.list[].duration | Number | 视频时长（秒） | `15` |
| data.list[].createdAt | String | 创建时间（ISO 8601格式） | `"2024-01-15T10:30:00Z"` |
| data.list[].status | String | 状态：`completed`, `failed`, `processing` | `"completed"` |
| data.pagination | Object | 分页信息 | - |
| data.pagination.page | Number | 当前页码 | `1` |
| data.pagination.pageSize | Number | 每页数量 | `20` |
| data.pagination.total | Number | 总记录数 | `50` |
| data.pagination.totalPages | Number | 总页数 | `3` |
| message | String | 响应消息 | `"获取成功"` |

**错误响应 (HTTP 401)**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权，请先登录",
    "details": {}
  }
}
```

---

### 7. 删除单个历史记录接口

删除指定的视频历史记录。

#### 接口信息

- **URL**: `/api/video/history/{historyId}`
- **方法**: `DELETE`
- **参数**: 路径参数 `historyId`
- **认证**: 需要（Bearer Token）

#### 请求参数

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| historyId | String | 是 | 历史记录ID | `"history_123456789"` |

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {},
  "message": "删除成功"
}
```

**错误响应 (HTTP 404)**:

```json
{
  "success": false,
  "error": {
    "code": "HISTORY_NOT_FOUND",
    "message": "历史记录不存在",
    "details": {}
  }
}
```

**错误响应 (HTTP 403)**:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "无权删除此记录",
    "details": {}
  }
}
```

---

### 8. 清空所有历史记录接口

清空当前用户的所有视频历史记录。

#### 接口信息

- **URL**: `/api/video/history/clear`
- **方法**: `DELETE`
- **认证**: 需要（Bearer Token）

#### 请求参数

无

#### 响应格式

**成功响应 (HTTP 200)**:

```json
{
  "success": true,
  "data": {
    "deletedCount": 50
  },
  "message": "已清空所有历史记录"
}
```

**响应字段说明**:

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| success | Boolean | 请求是否成功 | `true` |
| data | Object | 响应数据对象 | - |
| data.deletedCount | Number | 删除的记录数量 | `50` |
| message | String | 响应消息 | `"已清空所有历史记录"` |

**错误响应 (HTTP 401)**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "未授权，请先登录",
    "details": {}
  }
}
```

---

## 完整请求示例

### 示例1: 用户注册

**请求**:

```http
POST /api/auth/register HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

**响应**:

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "userId": "user_123456789",
    "username": "user123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "注册成功"
}
```

### 示例2: 用户登录

**请求**:

```http
POST /api/auth/login HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "userId": "user_123456789",
    "username": "user123",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "登录成功"
}
```

### 示例3: 同步模式 - 生成视频

**请求**:

```http
POST /api/video/generate HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "keywords": ["可爱", "粉色", "猫咪"],
  "style": "chikawa",
  "format": "mp4"
}
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "videoUrl": "https://cdn.example.com/videos/chikawa_abc123.mp4",
    "taskId": "task_123456789",
    "duration": 15,
    "thumbnail": "https://cdn.example.com/thumbnails/chikawa_abc123.jpg",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "视频生成成功"
}
```

### 示例4: 异步模式 - 提交任务

**请求**:

```http
POST /api/video/generate HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "keywords": ["可爱", "粉色"],
  "style": "chikawa",
  "format": "mp4"
}
```

**响应**:

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "success": true,
  "data": {
    "taskId": "task_123456789",
    "status": "processing",
    "estimatedTime": 60,
    "message": "视频生成任务已提交，预计60秒完成"
  },
  "message": "任务已提交"
}
```

### 示例5: 查询任务状态

**请求**:

```http
GET /api/video/status/task_123456789 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应（处理中）**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "taskId": "task_123456789",
    "status": "processing",
    "progress": 65,
    "createdAt": "2024-01-15T10:30:00Z",
    "message": "正在生成视频，进度65%"
  }
}
```

**响应（已完成）**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "taskId": "task_123456789",
    "status": "completed",
    "progress": 100,
    "videoUrl": "https://cdn.example.com/videos/chikawa_abc123.mp4",
    "duration": 15,
    "thumbnail": "https://cdn.example.com/thumbnails/chikawa_abc123.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:31:00Z",
    "message": "视频生成完成"
  }
}
```

### 示例6: 获取视频历史记录

**请求**:

```http
GET /api/video/history?page=1&pageSize=20&sort=createdAt_desc HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "list": [
      {
        "id": "history_123456789",
        "taskId": "task_123456789",
        "keywords": ["可爱", "粉色", "猫咪"],
        "videoUrl": "https://example.com/videos/abc123.mp4",
        "thumbnail": "https://example.com/thumbnails/abc123.jpg",
        "duration": 15,
        "createdAt": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "获取成功"
}
```

### 示例7: 删除单个历史记录

**请求**:

```http
DELETE /api/video/history/history_123456789 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {},
  "message": "删除成功"
}
```

### 示例8: 清空所有历史记录

**请求**:

```http
DELETE /api/video/history/clear HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "deletedCount": 50
  },
  "message": "已清空所有历史记录"
}
```

### 示例9: Token刷新

**请求**:

```http
POST /api/auth/refresh HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**响应**:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Token刷新成功"
}
```

---

## 错误处理

### 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息",
    "details": {
      "field": "具体字段信息（可选）"
    }
  }
}
```

### 常见错误码

| HTTP状态码 | 错误码 | 说明 | 解决方案 |
|-----------|--------|------|----------|
| 400 | INVALID_KEYWORDS | 关键字参数无效 | 检查关键字数量和格式 |
| 400 | KEYWORD_EMPTY | 关键字为空 | 确保至少提供一个非空关键字 |
| 400 | USERNAME_EXISTS | 用户名已存在 | 更换用户名 |
| 400 | INVALID_USERNAME | 用户名格式无效 | 检查用户名格式（3-20字符，字母数字下划线） |
| 400 | INVALID_PASSWORD | 密码格式无效 | 检查密码格式（至少8字符，包含字母和数字） |
| 400 | INVALID_EMAIL | 邮箱格式无效 | 检查邮箱格式 |
| 401 | INVALID_CREDENTIALS | 用户名或密码错误 | 检查用户名和密码 |
| 401 | USER_NOT_FOUND | 用户不存在 | 检查用户名是否正确 |
| 401 | UNAUTHORIZED | 未授权，请先登录 | 使用accessToken进行认证 |
| 401 | INVALID_REFRESH_TOKEN | 刷新令牌无效或已过期 | 重新登录获取新token |
| 403 | ACCOUNT_LOCKED | 账号已被锁定 | 联系客服解锁 |
| 403 | FORBIDDEN | 无权访问此资源 | 检查权限 |
| 404 | TASK_NOT_FOUND | 任务不存在 | 检查taskId是否正确 |
| 404 | HISTORY_NOT_FOUND | 历史记录不存在 | 检查historyId是否正确 |
| 429 | RATE_LIMIT_EXCEEDED | 请求频率过高 | 降低请求频率，稍后重试 |
| 500 | GENERATION_FAILED | 视频生成失败 | 联系技术支持 |
| 503 | SERVICE_UNAVAILABLE | 服务暂时不可用 | 稍后重试 |

---

## 视频要求

### 视频规格

- **格式**: MP4 (H.264编码)
- **分辨率**: 建议 1080x1920 (竖屏) 或 1920x1080 (横屏)
- **帧率**: 30fps
- **时长**: 10-30秒
- **文件大小**: 建议不超过 50MB

### Chikawa风格要求

- 可爱、温馨的视觉风格
- 柔和的色彩搭配
- 简洁的动画效果
- 符合关键字主题的内容

---

## 安全要求

### 认证方式

所有需要认证的接口都使用 **JWT Bearer Token** 认证方式。

**请求头格式**:

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Token获取流程**:
1. 用户通过 `/api/auth/register` 或 `/api/auth/login` 接口获取 `accessToken` 和 `refreshToken`
2. 在后续请求中，将 `accessToken` 放在 `Authorization` 请求头中
3. 当 `accessToken` 过期时（通常返回 401 错误），使用 `refreshToken` 调用 `/api/auth/refresh` 接口获取新的 `accessToken`
4. 如果 `refreshToken` 也过期，用户需要重新登录

**Token有效期**:
- `accessToken`: 通常为 1 小时（3600秒），具体以接口返回的 `expiresIn` 为准
- `refreshToken`: 通常为 7 天，具体以实际配置为准

**安全建议**:
- Token应存储在安全的地方（如Flutter的 `shared_preferences`）
- 不要在日志中输出完整的Token
- 使用HTTPS传输，避免Token被截获
- 定期刷新Token，避免过期

### 限流

- 建议实现请求限流机制
- 单个用户/IP：每分钟最多10次请求
- 单个用户/IP：每小时最多100次请求

---

## 性能要求

- **同步模式响应时间**: 建议在30秒内返回结果
- **异步模式**: 任务提交应在1秒内响应
- **状态查询**: 应在500ms内响应
- **视频URL**: 应支持CDN加速，确保全球访问速度

---

## 测试建议

### 测试用例

1. **正常流程测试**
   - 输入1个关键字
   - 输入2个关键字
   - 输入3个关键字

2. **异常流程测试**
   - 关键字为空
   - 关键字数量超过3个
   - 关键字包含特殊字符
   - 网络超时处理

3. **边界测试**
   - 关键字长度为1个字符
   - 关键字长度为100个字符
   - 并发请求测试

---

## 注意事项

1. **视频存储**: 建议使用对象存储服务（如AWS S3、阿里云OSS等）存储生成的视频
2. **视频有效期**: 建议设置视频保存期限（如7天），过期后自动删除
3. **任务ID**: 建议使用UUID或雪花算法生成唯一任务ID
4. **日志记录**: 记录所有请求和错误日志，便于问题排查
5. **监控告警**: 建议添加服务监控和告警机制

---

## 联系方式

如有疑问，请联系前端开发团队。

**文档版本**: v2.0  
**最后更新**: 2024-01-20

## 更新日志

### v2.0 (2024-01-20)
- ✅ 新增用户注册接口
- ✅ 新增用户登录接口
- ✅ 新增Token刷新接口
- ✅ 新增获取视频历史记录接口
- ✅ 新增删除单个历史记录接口
- ✅ 新增清空所有历史记录接口
- ✅ 更新所有接口路径，统一使用 `/api/` 前缀
- ✅ 更新认证方式说明，使用JWT Bearer Token
- ✅ 完善错误码列表
- ✅ 添加完整的请求示例

### v1.0 (2024-01-15)
- ✅ 初始版本
- ✅ 视频生成接口（同步/异步模式）
- ✅ 查询生成状态接口


