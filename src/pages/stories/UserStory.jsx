import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const UserStory = () => {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const [currentPage, setCurrentPage] = useState(0)
  const [story, setStory] = useState(null)

  useEffect(() => {
    // 从localStorage加载用户故事
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    const foundStory = userStories.find(s => s.id === storyId)
    
    if (foundStory) {
      setStory(foundStory)
    } else {
      alert('故事不存在')
      navigate('/graduation')
    }
  }, [storyId, navigate])

  if (!story) {
    return (
      <div className="story-page">
        <OceanBackground />
        <div className="story-content">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  const nextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="story-page story-user" style={{ '--story-color': story.color }}>
      <OceanBackground />
      <div className="story-content">
        <div className="story-header">
          <button className="back-to-graduation" onClick={() => navigate('/graduation')}>
            ← 返回毕业典礼
          </button>
          <div className="story-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentPage + 1) / story.pages.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="story-body">
          <div className="story-scene">{story.pages[currentPage].scene}</div>
          <h1 className="story-page-title">{story.pages[currentPage].title}</h1>
          <p className="story-text">{story.pages[currentPage].content}</p>
        </div>

        <div className="story-navigation">
          <button 
            className="nav-button prev-button"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            ← 上一页
          </button>
          <span className="page-indicator">
            {currentPage + 1} / {story.pages.length}
          </span>
          <button 
            className="nav-button next-button"
            onClick={nextPage}
            disabled={currentPage === story.pages.length - 1}
          >
            {currentPage === story.pages.length - 1 ? '完成 ✓' : '下一页 →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserStory


















