import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WordGame from '../components/WordGame'
import { completeLevel, unlockStory, unlockCharacter, isLevelCompleted } from '../utils/gameState'
import OceanBackground from '../components/OceanBackground'
import './LevelSelect.css'

const LevelSelect = ({ storyId, onBack }) => {
  const navigate = useNavigate()
  const [showGame, setShowGame] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)

  const storyLevels = {
    5: { level: 1, character: 'yandere-boy', name: '病娇男', emoji: '😈' },
    6: { level: 2, character: 'pure-girl', name: '清纯女', emoji: '👼' },
    7: { level: 3, character: 'bully-girl', name: '大姐大', emoji: '👑' }
  }

  const storyInfo = storyLevels[storyId]
  const levelCompleted = isLevelCompleted(storyInfo.level)

  const handleStartLevel = () => {
    setCurrentLevel(storyInfo.level)
    setShowGame(true)
  }

  const handleLevelComplete = () => {
    completeLevel(storyInfo.level)
    unlockStory(storyId)
    unlockCharacter(storyInfo.character)
    setShowGame(false)
    // 可以显示解锁提示
    setTimeout(() => {
      navigate(`/story/${storyId}`)
    }, 1000)
  }

  if (showGame) {
    return (
      <WordGame
        level={currentLevel}
        onComplete={handleLevelComplete}
        onClose={() => setShowGame(false)}
      />
    )
  }

  return (
    <div className="level-select-page">
      <OceanBackground />
      <div className="level-select-content">
        <button className="back-button" onClick={onBack}>
          ← 返回
        </button>

        <div className="level-info">
          <h1 className="level-title">解锁故事 {storyId}</h1>
          <div className="character-preview">
            <div className="character-icon">
              {storyInfo.emoji}
            </div>
            <p className="character-name">{storyInfo.name}</p>
          </div>

          <div className="level-description">
            <p>通过背单词关卡来解锁这个故事</p>
            <p>需要记住 5 个单词才能解锁</p>
            <p>解锁后可以在饲养区饲养 {storyInfo.name}</p>
          </div>

          {levelCompleted ? (
            <div className="level-completed">
              <p>✅ 关卡已完成</p>
              <button 
                className="play-story-button"
                onClick={() => navigate(`/story/${storyId}`)}
              >
                阅读故事 →
              </button>
            </div>
          ) : (
            <button 
              className="start-level-button"
              onClick={handleStartLevel}
            >
              开始关卡
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LevelSelect

