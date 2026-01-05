import React, { useState, useEffect } from 'react'
import './WordGame.css'

const WordGame = ({ level, onComplete, onClose }) => {
  // 海洋主题的单词库
  const wordSets = {
    1: [ // 故事5 - 病娇男
      { word: 'obsession', meaning: '痴迷，着迷', example: 'His obsession with her grew stronger.' },
      { word: 'pursue', meaning: '追求，追赶', example: 'He would pursue her everywhere.' },
      { word: 'capture', meaning: '捕获，抓住', example: 'He wanted to capture her heart.' },
      { word: 'possess', meaning: '拥有，占有', example: 'He felt he must possess her.' },
      { word: 'devotion', meaning: '奉献，忠诚', example: 'His devotion was overwhelming.' }
    ],
    2: [ // 故事6 - 清纯女
      { word: 'innocent', meaning: '无辜的，天真的', example: 'She was innocent and pure.' },
      { word: 'bully', meaning: '霸凌，欺负', example: 'She suffered from bullying.' },
      { word: 'protect', meaning: '保护', example: 'He wanted to protect her.' },
      { word: 'rescue', meaning: '拯救，救援', example: 'He came to rescue her.' },
      { word: 'shelter', meaning: '庇护，避难所', example: 'She found shelter in his arms.' }
    ],
    3: [ // 故事7 - 大姐大
      { word: 'jealousy', meaning: '嫉妒', example: 'Her jealousy consumed her.' },
      { word: 'rejection', meaning: '拒绝，排斥', example: 'She faced rejection.' },
      { word: 'rivalry', meaning: '竞争，对抗', example: 'There was rivalry between them.' },
      { word: 'confession', meaning: '告白，坦白', example: 'She made a confession.' },
      { word: 'acceptance', meaning: '接受，接纳', example: 'She learned acceptance.' }
    ]
  }

  const [words] = useState(wordSets[level] || wordSets[1])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [completedWords, setCompletedWords] = useState([])
  const [gameWon, setGameWon] = useState(false)

  const currentWord = words[currentWordIndex]

  useEffect(() => {
    if (completedWords.length === words.length && !gameWon) {
      setGameWon(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    }
  }, [completedWords, words.length, gameWon, onComplete])

  const handleCheck = () => {
    const userAnswer = userInput.trim().toLowerCase()
    const correctAnswer = currentWord.word.toLowerCase()

    if (userAnswer === correctAnswer) {
      setCorrectCount(prev => prev + 1)
      const newCompletedWords = completedWords.includes(currentWordIndex)
        ? completedWords
        : [...completedWords, currentWordIndex]
      setCompletedWords(newCompletedWords)
      setUserInput('')
      setShowAnswer(false)
      
      if (currentWordIndex < words.length - 1) {
        setTimeout(() => {
          setCurrentWordIndex(currentWordIndex + 1)
        }, 500)
      } else {
        // 如果是最后一个单词且答对了，检查是否完成
        if (newCompletedWords.length === words.length) {
          setTimeout(() => {
            setGameWon(true)
            setTimeout(() => {
              onComplete()
            }, 1500)
          }, 500)
        }
      }
    } else {
      setShowAnswer(true)
    }
  }

  const handleSkip = () => {
    setShowAnswer(true)
  }

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      // 标记当前单词为已学（即使答错了也算看过）
      if (!completedWords.includes(currentWordIndex)) {
        setCompletedWords(prev => [...prev, currentWordIndex])
      }
      setCurrentWordIndex(currentWordIndex + 1)
      setUserInput('')
      setShowAnswer(false)
    } else {
      // 如果已经是最后一个单词，标记为完成并触发完成逻辑
      const newCompletedWords = completedWords.includes(currentWordIndex) 
        ? completedWords 
        : [...completedWords, currentWordIndex]
      
      setCompletedWords(newCompletedWords)
      
      // 如果所有单词都已完成，立即触发完成
      if (newCompletedWords.length === words.length) {
        setGameWon(true)
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswer) {
      handleCheck()
    }
  }

  const progress = (completedWords.length / words.length) * 100

  return (
    <div className="word-game-overlay">
      <div className="word-game-container">
        <div className="game-header">
          <h2>背单词关卡 {level}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="progress-section">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            进度: {completedWords.length} / {words.length}
          </p>
        </div>

        {gameWon ? (
          <div className="game-result win">
            <h2>🎉 恭喜完成！</h2>
            <p>你成功记住了所有单词！</p>
            <p>解锁了新的人物和故事！</p>
          </div>
        ) : (
          <div className="word-content">
            <div className="word-card">
              <div className="word-number">
                单词 {currentWordIndex + 1} / {words.length}
              </div>
              
              <div className="word-meaning">
                <h3>中文意思：</h3>
                <p className="meaning-text">{currentWord.meaning}</p>
              </div>

              <div className="word-example">
                <h3>例句：</h3>
                <p className="example-text">{currentWord.example}</p>
              </div>

              <div className="word-input-section">
                <label>请输入英文单词：</label>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入单词..."
                  className="word-input"
                  disabled={showAnswer}
                  autoFocus
                />
              </div>

              {showAnswer && (
                <div className="answer-display">
                  <p className="correct-answer">
                    正确答案：<strong>{currentWord.word}</strong>
                  </p>
                </div>
              )}

              <div className="word-actions">
                {!showAnswer ? (
                  <>
                    <button 
                      className="action-button check-button"
                      onClick={handleCheck}
                      disabled={!userInput.trim()}
                    >
                      ✓ 检查
                    </button>
                    <button 
                      className="action-button skip-button"
                      onClick={handleSkip}
                    >
                      💡 提示
                    </button>
                  </>
                ) : (
                  <button 
                    className="action-button next-button"
                    onClick={handleNext}
                  >
                    {currentWordIndex < words.length - 1 ? '下一个 →' : '完成'}
                  </button>
                )}
              </div>
            </div>

            <div className="word-stats">
              <div className="stat-item">
                <span>正确: {correctCount}</span>
              </div>
              <div className="stat-item">
                <span>已学: {completedWords.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WordGame

