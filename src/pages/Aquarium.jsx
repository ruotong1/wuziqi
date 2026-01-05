import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../components/OceanBackground'
import { isCharacterUnlocked, getCharacter, feedCharacter } from '../utils/gameState'
import './Aquarium.css'

const Aquarium = () => {
  const navigate = useNavigate()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [feedMessage, setFeedMessage] = useState('')

  const characters = [
    {
      id: 'yandere-boy',
      name: '病娇男',
      emoji: '😈',
      storyId: 5,
      color: '#FF4757',
      description: '对爱情有着极端执着的病娇男'
    },
    {
      id: 'pure-girl',
      name: '清纯女',
      emoji: '👼',
      storyId: 6,
      color: '#FFA502',
      description: '温柔善良的清纯女生'
    },
    {
      id: 'bully-girl',
      name: '大姐大',
      emoji: '👑',
      storyId: 7,
      color: '#5F27CD',
      description: '强势霸道的校园大姐大'
    }
  ]

  const unlockedCharacters = characters.filter(char => isCharacterUnlocked(char.id))

  const handleFeed = () => {
    if (!selectedCharacter) return
    
    const result = feedCharacter(selectedCharacter.id)
    if (result.success) {
      setFeedMessage('喂食成功！经验 +10')
      const updatedData = getCharacter(selectedCharacter.id)
      setSelectedCharacter({
        ...selectedCharacter,
        ...updatedData
      })
      setTimeout(() => setFeedMessage(''), 3000)
    } else {
      setFeedMessage(result.message)
      setTimeout(() => setFeedMessage(''), 3000)
    }
  }

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊'
      case 'excited': return '🤩'
      case 'loved': return '💕'
      default: return '😊'
    }
  }

  const getMoodText = (mood) => {
    switch (mood) {
      case 'happy': return '开心'
      case 'excited': return '兴奋'
      case 'loved': return '被爱'
      default: return '开心'
    }
  }

  console.log('Aquarium rendered, unlockedCharacters:', unlockedCharacters.length)

  return (
    <div className="aquarium-page" style={{ position: 'relative', zIndex: 100 }}>
      <OceanBackground />
      <div className="aquarium-content-wrapper">
        <div className="aquarium-content">
          <div className="aquarium-header">
            <h1 className="aquarium-title">🐠 饲养区 🐠</h1>
            <button 
              className="back-button"
              onClick={() => navigate('/graduation')}
              style={{ 
                position: 'relative', 
                zIndex: 200,
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
            >
              ← 返回毕业典礼
            </button>
          </div>

          {unlockedCharacters.length === 0 ? (
            <div className="empty-aquarium">
              <div className="empty-icon">🐠</div>
              <p className="empty-text">还没有解锁任何人物</p>
              <p className="empty-hint">通过背单词关卡解锁故事，即可解锁对应人物！</p>
              <button 
                className="back-to-graduation-button"
                onClick={() => navigate('/graduation')}
                style={{ 
                  position: 'relative', 
                  zIndex: 200,
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1
                }}
              >
                返回毕业典礼
              </button>
            </div>
          ) : (
            <>
              <div className="characters-grid">
                {unlockedCharacters.map((char) => {
                  const characterData = getCharacter(char.id)
                  const isSelected = selectedCharacter?.id === char.id
                  
                  return (
                    <div
                      key={char.id}
                      className={`character-card ${isSelected ? 'selected' : ''}`}
                      style={{ '--char-color': char.color }}
                      onClick={() => {
                        const data = getCharacter(char.id)
                        setSelectedCharacter({ ...char, ...data })
                      }}
                    >
                      <div className="character-emoji">{char.emoji}</div>
                      <div className="character-name">{char.name}</div>
                      {characterData && (
                        <div className="character-level">
                          Lv.{characterData.level}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedCharacter && (
                <div className="character-detail">
                  <div className="detail-header">
                    <div className="detail-emoji">{selectedCharacter.emoji}</div>
                    <div className="detail-info">
                      <h2>{selectedCharacter.name}</h2>
                      <p className="detail-description">{selectedCharacter.description}</p>
                    </div>
                  </div>

                  {selectedCharacter.level && (
                    <div className="character-stats">
                      <div className="stat-row">
                        <span className="stat-label">等级：</span>
                        <span className="stat-value">Lv.{selectedCharacter.level}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">经验：</span>
                        <span className="stat-value">{selectedCharacter.exp || 0} / {selectedCharacter.level * 100}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">喂食次数：</span>
                        <span className="stat-value">{selectedCharacter.feedCount || 0} 次</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">心情：</span>
                        <span className="stat-value">
                          {getMoodEmoji(selectedCharacter.mood || 'happy')} {getMoodText(selectedCharacter.mood || 'happy')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="exp-bar-container">
                    <div 
                      className="exp-bar-fill" 
                      style={{ 
                        width: `${((selectedCharacter.exp || 0) % 100) / 100 * 100}%` 
                      }}
                    ></div>
                  </div>

                  <div className="feed-section">
                    <button 
                      className="feed-button"
                      onClick={handleFeed}
                    >
                      🍽️ 喂食
                    </button>
                    {feedMessage && (
                      <p className={`feed-message ${feedMessage.includes('成功') ? 'success' : 'error'}`}>
                        {feedMessage}
                      </p>
                    )}
                    <p className="feed-hint">每次喂食可获得10经验，1小时后可再次喂食</p>
                  </div>

                  <button 
                    className="view-story-button"
                    onClick={() => navigate(`/story/${selectedCharacter.storyId}`)}
                  >
                    阅读故事 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Aquarium
