import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../components/OceanBackground'
import { isStoryUnlocked } from '../utils/gameState'
import './Graduation.css'

const Graduation = () => {
  const navigate = useNavigate()
  const [userStories, setUserStories] = useState([])

  useEffect(() => {
    // 加载用户创建的故事
    const stories = JSON.parse(localStorage.getItem('userStories') || '[]')
    setUserStories(stories)
  }, [])

  const stories = [
    {
      id: 1,
      title: '珊瑚与珍珠的约定',
      description: '在图书馆的角落里，他们因为一本古老的海洋诗集而相遇...',
      color: '#FF6B9D',
      unlocked: true
    },
    {
      id: 2,
      title: '潮汐下的秘密',
      description: '两个来自不同海域的人鱼，在毕业舞会上发现了彼此的秘密...',
      color: '#4ECDC4',
      unlocked: true
    },
    {
      id: 3,
      title: '海星与贝壳',
      description: '从小一起长大的青梅竹马，在毕业这天终于说出了心里话...',
      color: '#FFE66D',
      unlocked: true
    },
    {
      id: 4,
      title: '深海的回音',
      description: '通过古老的传音贝壳，他们跨越了海洋的距离找到了彼此...',
      color: '#95E1D3',
      unlocked: true
    },
    {
      id: 5,
      title: '躲藏的追逐',
      description: '病娇男在校园里疯狂追赶清纯女生，一场紧张刺激的躲藏游戏开始了...',
      color: '#FF4757',
      unlocked: false,
      requiresLevel: true
    },
    {
      id: 6,
      title: '霸凌后的救赎',
      description: '清纯女大经历了校园大姐大的霸凌，却被病娇男意外爱上...',
      color: '#FFA502',
      unlocked: false,
      requiresLevel: true
    },
    {
      id: 7,
      title: '三角恋的纠葛',
      description: '大姐大喜欢病娇男，但病娇男却爱上了清纯女，复杂的三角关系...',
      color: '#5F27CD',
      unlocked: false,
      requiresLevel: true
    }
  ]

  const handleStoryClick = (story) => {
    if (story.isUserStory) {
      navigate(`/user-story/${story.id}`)
    } else if (story.requiresLevel && !isStoryUnlocked(story.id)) {
      navigate(`/level/${story.id}`)
    } else if (isStoryUnlocked(story.id)) {
      navigate(`/story/${story.id}`)
    }
  }

  return (
    <div className="graduation-page">
      <OceanBackground />
      <div className="graduation-content">
        <div className="graduation-header">
          <h1 className="graduation-title">🎓 毕业典礼 🎓</h1>
          <p className="graduation-subtitle">珊瑚学院 · 2024届毕业典礼</p>
        </div>

        <div className="ceremony-scene">
          <div className="stage">
            <div className="stage-lights">
              <div className="light light-1"></div>
              <div className="light light-2"></div>
              <div className="light light-3"></div>
            </div>
            <div className="stage-content">
              <div className="principal">👑</div>
              <p className="stage-text">校长正在致辞...</p>
            </div>
          </div>
        </div>

        <div className="stories-section">
          <div className="stories-header">
            <h2 className="stories-title">✨ 今天发生的爱情故事 ✨</h2>
            <button 
              className="new-story-button"
              onClick={() => navigate('/story-editor')}
            >
              ✍️ 新建故事
            </button>
          </div>
          <div className="stories-grid">
            {stories.map((story) => {
              const unlocked = isStoryUnlocked(story.id)
              return (
                <div
                  key={story.id}
                  className={`story-card ${unlocked ? 'unlocked' : 'locked'}`}
                  style={{ '--story-color': story.color }}
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="story-card-glow"></div>
                  <div className="story-number">{story.id}</div>
                  {!unlocked && story.requiresLevel && (
                    <div className="lock-overlay">
                      <div className="lock-icon">🔒</div>
                      <p>需要通关关卡</p>
                    </div>
                  )}
                  <h3 className="story-card-title">{story.title}</h3>
                  <p className="story-card-description">{story.description}</p>
                  <div className="story-card-button">
                    <span>
                      {unlocked 
                        ? '阅读故事 →' 
                        : story.requiresLevel 
                        ? '开始关卡 →' 
                        : '未解锁'}
                    </span>
                  </div>
                </div>
              )
            })}
            {userStories.map((story) => (
              <div
                key={story.id}
                className="story-card unlocked user-story"
                style={{ '--story-color': story.color }}
                onClick={() => handleStoryClick({ ...story, isUserStory: true })}
              >
                <div className="story-card-glow"></div>
                <div className="user-story-badge">✍️</div>
                <h3 className="story-card-title">{story.title}</h3>
                <p className="story-card-description">{story.description}</p>
                <div className="story-card-button">
                  <span>阅读故事 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="aquarium-button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Aquarium button clicked')
              navigate('/aquarium')
            }}
            style={{
              position: 'relative',
              zIndex: 1000,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            🐠 饲养区
          </button>
          <button 
            className="report-button"
            onClick={() => navigate('/report')}
            style={{
              position: 'relative',
              zIndex: 1000,
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            🚨 一键举报
          </button>
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default Graduation
