import React, { useState, useEffect, useCallback } from 'react'
import './EliminationGame.css'

const EliminationGame = ({ level, onComplete, onClose }) => {
  const [cards, setCards] = useState([])
  const [selectedCards, setSelectedCards] = useState([])
  const [stackCards, setStackCards] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)

  // 海洋主题的图标
  const icons = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦀', '🦞', '🐚', '🌊', '💎', '⭐']

  // 初始化游戏
  const initGame = useCallback(() => {
    const iconCount = 4 + level // 根据关卡增加图标种类
    const iconsForLevel = icons.slice(0, Math.min(iconCount, icons.length))
    const pairsPerIcon = 3 // 每对图标3张

    const newCards = []
    iconsForLevel.forEach((icon, iconIndex) => {
      for (let i = 0; i < pairsPerIcon; i++) {
        newCards.push({
          id: `${iconIndex}-${i}`,
          icon: icon,
          x: Math.random() * 800,
          y: Math.random() * 400,
          zIndex: Math.floor(Math.random() * 3)
        })
      }
    })

    // 打乱顺序
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]]
    }

    setCards(newCards.map((card, index) => ({
      ...card,
      visible: true,
      index
    })))
    setStackCards([])
    setSelectedCards([])
    setMoves(0)
    setGameOver(false)
    setGameWon(false)
    setHintUsed(false)
  }, [level])

  useEffect(() => {
    initGame()
  }, [initGame])

  // 检查卡片是否可以被点击（上层没有遮挡）
  const isCardClickable = (cardIndex) => {
    const card = cards[cardIndex]
    if (!card || !card.visible) return false

    // 检查是否有其他卡片覆盖在上面（zIndex更高且位置重叠）
    for (let i = 0; i < cards.length; i++) {
      if (i === cardIndex) continue
      const otherCard = cards[i]
      if (otherCard.visible && otherCard.zIndex > card.zIndex) {
        const distance = Math.sqrt(
          Math.pow(otherCard.x - card.x, 2) + 
          Math.pow(otherCard.y - card.y, 2)
        )
        if (distance < 80) { // 如果距离太近，认为被遮挡
          return false
        }
      }
    }
    return true
  }

  // 处理卡片点击
  const handleCardClick = (cardIndex) => {
    if (gameOver || gameWon) return
    if (selectedCards.length >= 2) return
    if (!isCardClickable(cardIndex)) return

    const card = cards[cardIndex]
    if (!card.visible) return

    const newSelected = [...selectedCards, cardIndex]
    setSelectedCards(newSelected)
    setMoves(moves + 1)

    if (newSelected.length === 2) {
      const card1 = cards[newSelected[0]]
      const card2 = cards[newSelected[1]]

      if (card1.icon === card2.icon) {
        // 匹配成功
        setTimeout(() => {
          const newCards = cards.map((c, i) => {
            if (i === newSelected[0] || i === newSelected[1]) {
              return { ...c, visible: false }
            }
            return c
          })
          setCards(newCards)
          setSelectedCards([])

          // 检查是否获胜
          const remainingCards = newCards.filter(c => c.visible)
          if (remainingCards.length === 0) {
            setGameWon(true)
            setTimeout(() => {
              onComplete()
            }, 1500)
          }
        }, 300)
      } else {
        // 匹配失败，移到堆叠区
        setTimeout(() => {
          const newStack = [...stackCards, card1, card2]
          setStackCards(newStack)
          setSelectedCards([])

          // 检查是否失败（堆叠区超过7张）
          if (newStack.length >= 7) {
            setGameOver(true)
          }
        }, 500)
      }
    }
  }

  // 使用提示
  const useHint = () => {
    if (hintUsed) return
    setHintUsed(true)

    // 找到一对可匹配的卡片
    const clickableCards = cards
      .map((card, index) => ({ card, index }))
      .filter(({ index }) => isCardClickable(index) && cards[index].visible)

    for (let i = 0; i < clickableCards.length; i++) {
      for (let j = i + 1; j < clickableCards.length; j++) {
        if (clickableCards[i].card.icon === clickableCards[j].card.icon) {
          // 高亮提示
          setTimeout(() => {
            const card1 = document.querySelector(`[data-card-index="${clickableCards[i].index}"]`)
            const card2 = document.querySelector(`[data-card-index="${clickableCards[j].index}"]`)
            if (card1) card1.classList.add('hint-highlight')
            if (card2) card2.classList.add('hint-highlight')
            setTimeout(() => {
              if (card1) card1.classList.remove('hint-highlight')
              if (card2) card2.classList.remove('hint-highlight')
            }, 2000)
          }, 100)
          return
        }
      }
    }
  }

  // 洗牌
  const shuffle = () => {
    const visibleCards = cards.filter(c => c.visible)
    const shuffled = visibleCards.map(card => ({
      ...card,
      x: Math.random() * 800,
      y: Math.random() * 400,
      zIndex: Math.floor(Math.random() * 3)
    }))
    
    setCards(cards.map(c => {
      const newCard = shuffled.find(sc => sc.id === c.id)
      return newCard ? { ...c, ...newCard } : c
    }))
    setMoves(moves + 1)
  }

  const clickableCards = cards.filter((card, index) => 
    card.visible && isCardClickable(index)
  )

  return (
    <div className="elimination-game-overlay">
      <div className="elimination-game-container">
        <div className="game-header">
          <h2>关卡 {level} - 消除配对</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="game-stats">
          <div className="stat-item">
            <span>步数: {moves}</span>
          </div>
          <div className="stat-item">
            <span>剩余: {clickableCards.length}</span>
          </div>
          <div className="stat-item">
            <span>堆叠: {stackCards.length}/7</span>
          </div>
        </div>

        {gameWon && (
          <div className="game-result win">
            <h2>🎉 恭喜通关！</h2>
            <p>你成功解锁了新的故事！</p>
          </div>
        )}

        {gameOver && (
          <div className="game-result lose">
            <h2>😢 游戏结束</h2>
            <p>堆叠区已满，重新开始吧！</p>
            <button onClick={initGame} className="retry-button">重新开始</button>
          </div>
        )}

        {!gameOver && !gameWon && (
          <>
            <div className="game-board">
              {cards.map((card, index) => (
                card.visible && (
                  <div
                    key={card.id}
                    data-card-index={index}
                    className={`game-card ${selectedCards.includes(index) ? 'selected' : ''} ${isCardClickable(index) ? 'clickable' : 'blocked'}`}
                    style={{
                      left: `${card.x}px`,
                      top: `${card.y}px`,
                      zIndex: card.zIndex + 10,
                      transform: `scale(${1 - card.zIndex * 0.1})`,
                      opacity: 1 - card.zIndex * 0.15
                    }}
                    onClick={() => handleCardClick(index)}
                  >
                    {card.icon}
                  </div>
                )
              ))}
            </div>

            <div className="stack-area">
              <div className="stack-label">堆叠区</div>
              <div className="stack-cards">
                {stackCards.map((card, index) => (
                  <div key={index} className="stack-card">
                    {card.icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="game-controls">
              <button 
                onClick={useHint} 
                className="control-button hint-button"
                disabled={hintUsed}
              >
                💡 提示 {hintUsed ? '(已使用)' : ''}
              </button>
              <button onClick={shuffle} className="control-button shuffle-button">
                🔄 洗牌
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default EliminationGame
