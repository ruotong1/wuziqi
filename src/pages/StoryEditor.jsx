import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../components/OceanBackground'
import './StoryEditor.css'

const StoryEditor = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pages, setPages] = useState([{ title: '', content: '', scene: '💕' }])
  const [color, setColor] = useState('#FF6B9D')

  const sceneEmojis = ['💕', '💙', '💚', '💛', '🧡', '💜', '❤️', '💖', '💗', '💘', '💝', '💞', '💟', '🌊', '🐚', '🐟', '🐠', '⭐', '✨', '🌟', '💫', '🎓', '📚', '💌', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '🎶', '🌙', '☀️', '🌈', '🌺', '🌸', '🌷', '🌹', '🌻', '🌼', '🌿', '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿']

  const colorOptions = [
    { value: '#FF6B9D', name: '粉色' },
    { value: '#4ECDC4', name: '青色' },
    { value: '#FFE66D', name: '黄色' },
    { value: '#95E1D3', name: '薄荷绿' },
    { value: '#FF4757', name: '红色' },
    { value: '#FFA502', name: '橙色' },
    { value: '#5F27CD', name: '紫色' },
    { value: '#1E90FF', name: '蓝色' },
    { value: '#00BFFF', name: '天蓝色' },
    { value: '#87CEEB', name: '浅蓝色' }
  ]

  const addPage = () => {
    setPages([...pages, { title: '', content: '', scene: '💕' }])
  }

  const removePage = (index) => {
    if (pages.length > 1) {
      setPages(pages.filter((_, i) => i !== index))
    }
  }

  const updatePage = (index, field, value) => {
    const newPages = [...pages]
    newPages[index][field] = value
    setPages(newPages)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('请输入故事标题')
      return
    }

    if (pages.some(page => !page.title.trim() || !page.content.trim())) {
      alert('请填写所有页面的标题和内容')
      return
    }

    // 生成故事ID
    const storyId = `user-${Date.now()}`
    
    // 获取现有用户故事
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    
    // 创建新故事
    const newStory = {
      id: storyId,
      title: title.trim(),
      description: description.trim() || '用户自定义故事',
      color: color,
      pages: pages.map(page => ({
        title: page.title.trim(),
        content: page.content.trim(),
        scene: page.scene
      })),
      createdAt: new Date().toISOString()
    }

    // 保存故事
    userStories.push(newStory)
    localStorage.setItem('userStories', JSON.stringify(userStories))

    alert('故事创建成功！')
    navigate('/graduation')
  }

  return (
    <div className="story-editor-page">
      <OceanBackground />
      <div className="story-editor-content">
        <div className="editor-header">
          <h1 className="editor-title">✍️ 创建我的故事 ✍️</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/graduation')}
          >
            ← 返回
          </button>
        </div>

        <div className="editor-form">
          <div className="form-section">
            <h2 className="section-title">基本信息</h2>
            <div className="form-group">
              <label>故事标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入故事标题"
                required
              />
            </div>

            <div className="form-group">
              <label>故事简介</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要描述这个故事..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>主题颜色</label>
              <div className="color-options">
                {colorOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`color-option ${color === option.value ? 'selected' : ''}`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setColor(option.value)}
                    title={option.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="pages-header">
              <h2 className="section-title">故事内容</h2>
              <button 
                type="button"
                className="add-page-button"
                onClick={addPage}
              >
                + 添加页面
              </button>
            </div>

            {pages.map((page, index) => (
              <div key={index} className="page-editor">
                <div className="page-header">
                  <h3 className="page-number">页面 {index + 1}</h3>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      className="remove-page-button"
                      onClick={() => removePage(index)}
                    >
                      × 删除
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>场景图标</label>
                  <div className="scene-selector">
                    {sceneEmojis.slice(0, 20).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`scene-emoji ${page.scene === emoji ? 'selected' : ''}`}
                        onClick={() => updatePage(index, 'scene', emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>页面标题 *</label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => updatePage(index, 'title', e.target.value)}
                    placeholder="输入页面标题"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>页面内容 *</label>
                  <textarea
                    value={page.content}
                    onChange={(e) => updatePage(index, 'content', e.target.value)}
                    placeholder="输入页面内容..."
                    rows="4"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="save-button"
              onClick={handleSave}
            >
              💾 保存故事
            </button>
            <button 
              type="button"
              className="cancel-button"
              onClick={() => navigate('/graduation')}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoryEditor






















