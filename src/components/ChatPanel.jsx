import React, { useState, useEffect, useRef } from 'react'
import { searchBots, getBotDetail, getBotById, sendMessageToBot, setApiToken, getApiToken, setApiBaseUrl, getApiBaseUrl } from '../utils/botApi'
import './ChatPanel.css'

const ChatPanel = ({ isOpen, onClose, onGameLog }) => {
  const [bots, setBots] = useState([])
  const [selectedBot, setSelectedBot] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [botIdInput, setBotIdInput] = useState('') // 直接输入bot_id
  const [isLoading, setIsLoading] = useState(false)
  const [apiToken, setApiTokenState] = useState(getApiToken())
  const [apiBaseUrl, setApiBaseUrlState] = useState(getApiBaseUrl())
  const messagesEndRef = useRef(null)
  const chatParentIdRef = useRef(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 搜索bot列表
  const handleSearchBots = async () => {
    if (!apiToken) {
      alert('请先设置API Token')
      return
    }

    setIsLoading(true)
    try {
      const data = await searchBots(searchKeyword)
      if (data.code === 0 && data.data) {
        setBots(Array.isArray(data.data) ? data.data : data.data.list || [])
      }
    } catch (error) {
      console.error('搜索bot失败:', error)
      alert('搜索bot失败，请检查API Token和网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  // 选择bot并获取详情
  const handleSelectBot = async (bot) => {
    setIsLoading(true)
    try {
      const data = await getBotDetail(bot.id)
      if (data.code === 0 && data.data) {
        setSelectedBot(data.data)
        setMessages([{
          type: 'system',
          content: `已连接到 ${data.data.name}，开始聊天吧！`
        }])
        chatParentIdRef.current = null
      }
    } catch (error) {
      console.error('获取bot详情失败:', error)
      alert('获取bot详情失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBot) return

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const data = await sendMessageToBot(selectedBot.id, inputMessage, chatParentIdRef.current)
      if (data.code === 0 && data.data) {
        const botMessage = {
          type: 'bot',
          content: data.data.message || data.data.content || '收到',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        chatParentIdRef.current = data.data.parent_id || data.data.id
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, {
        type: 'error',
        content: '发送消息失败，请检查网络连接'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 发送游戏日志给bot
  const sendGameLogToBot = async (logMessage) => {
    if (!selectedBot) return

    try {
      const data = await sendMessageToBot(selectedBot.id, logMessage, chatParentIdRef.current)
      if (data.code === 0 && data.data) {
        const botMessage = {
          type: 'bot',
          content: data.data.message || data.data.content || '收到',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        chatParentIdRef.current = data.data.parent_id || data.data.id
      }
    } catch (error) {
      console.error('发送游戏日志失败:', error)
    }
  }

  // 设置API Token和Base URL
  const handleSetToken = () => {
    const token = prompt('请输入API Token:')
    if (token) {
      setApiToken(token)
      setApiTokenState(token)
    }
    
    const url = prompt('请输入API Base URL (留空使用默认):', getApiBaseUrl())
    if (url !== null) {
      if (url.trim()) {
        setApiBaseUrl(url.trim())
        setApiBaseUrlState(url.trim())
      }
    }
  }

  // 暴露发送游戏日志的方法给父组件
  useEffect(() => {
    if (onGameLog) {
      onGameLog(sendGameLogToBot)
    }
  }, [selectedBot, chatParentIdRef.current])

  if (!isOpen) return null

  return (
    <div className="chat-panel-overlay" onClick={onClose}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3>AI聊天助手</h3>
          <div className="chat-header-actions">
            {!apiToken && (
              <button className="chat-token-btn" onClick={handleSetToken}>
                设置Token
              </button>
            )}
            <button className="chat-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {!selectedBot ? (
          <div className="chat-bot-selector">
            <div className="bot-connect-section">
              <h4 style={{ marginBottom: '15px', color: '#333' }}>通过Bot ID连接</h4>
              <input
                type="text"
                placeholder="请输入bot_id（例如：Wn8oWQ9yBmNv）"
                value={botIdInput}
                onChange={(e) => setBotIdInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnectByBotId()}
                className="bot-search-input"
              />
              <button onClick={handleConnectByBotId} disabled={isLoading || !botIdInput.trim()} className="bot-search-btn">
                {isLoading ? '连接中...' : '连接'}
              </button>
            </div>

            {/* 可选：保留搜索功能作为备选 */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 182, 193, 0.3)' }}>
              <h4 style={{ marginBottom: '15px', color: '#333' }}>搜索Bot（可选）</h4>
              <div className="bot-search-section">
                <input
                  type="text"
                  placeholder="搜索bot..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchBots()}
                  className="bot-search-input"
                />
                <button onClick={handleSearchBots} disabled={isLoading} className="bot-search-btn">
                  {isLoading ? '搜索中...' : '搜索'}
                </button>
              </div>

              {bots.length > 0 && (
                <div className="bot-list" style={{ marginTop: '15px' }}>
                  {bots.map((bot) => (
                    <div key={bot.id} className="bot-item" onClick={() => handleSelectBot(bot)}>
                      <img src={bot.avatar || '/default-avatar.png'} alt={bot.name} className="bot-avatar" />
                      <div className="bot-info">
                        <div className="bot-name">{bot.name}</div>
                        <div className="bot-desc">{bot.primary_desc || bot.secondary_desc || '暂无描述'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-content">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.type}`}>
                  {msg.type === 'bot' && selectedBot && (
                    <img src={selectedBot.avatar} alt={selectedBot.name} className="message-avatar" />
                  )}
                  <div className="message-content">
                    <div className="message-text">{msg.content}</div>
                    <div className="message-time">
                      {msg.timestamp?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message bot">
                  <div className="message-content">
                    <div className="message-text typing">正在输入...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-section">
              <input
                type="text"
                placeholder="输入消息..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="chat-input"
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} className="chat-send-btn">
                发送
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPanel

