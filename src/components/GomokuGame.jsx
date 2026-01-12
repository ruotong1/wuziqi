import React, { useState, useEffect, useCallback, useRef } from 'react'
import './GomokuGame.css'

const BOARD_SIZE = 15
const EMPTY = 0
const BLACK = 1
const WHITE = 2
const CELL_SIZE = 30 // 每个交叉点的大小

const GomokuGame = () => {
  const [board, setBoard] = useState(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
  )
  const [currentPlayer, setCurrentPlayer] = useState(BLACK)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [playerColor, setPlayerColor] = useState(BLACK)
  const [aiColor, setAiColor] = useState(WHITE)
  const [winningLine, setWinningLine] = useState(null)
  const [moveHistory, setMoveHistory] = useState([]) // 当前游戏的走子记录
  const [gameHistory, setGameHistory] = useState(() => {
    // 从localStorage加载历史记录
    const saved = localStorage.getItem('gomoku-history')
    return saved ? JSON.parse(saved) : []
  })
  const [showHistory, setShowHistory] = useState(false) // 显示历史记录面板
  const [playerSkillEffect, setPlayerSkillEffect] = useState(null) // 玩家技能特效：{ skillName, imageIndex }
  const boardRef = useRef(null)
  const isPlayerTurnRef = useRef(null)
  
  // 技能列表
  const skills = [
    { id: 'feisha', name: '飞沙走石', desc: '拿走对手任意一枚棋子' },
    { id: 'liangji', name: '两极反转', desc: '双方棋子互换' },
    { id: 'wuzhong', name: '无中生有', desc: '任意位置施放一枚棋子' },
    { id: 'douzhuan', name: '斗转星移', desc: '将对手任意一枚棋子随意转移至棋盘上其他位置' },
    { id: 'tiaohu', name: '调虎离山', desc: '移除对手一枚棋子' },
    { id: 'liba', name: '力拔山兮', desc: '将对手棋盘上所有棋子清空' },
    { id: 'lebu', name: '乐不思蜀', desc: '对手本回合不可出棋并原地哈哈大笑' },
    { id: 'shumu', name: '鼠目寸光', desc: '对手本回合带鸟视镜投出一枚棋子' },
    { id: 'wanjian', name: '万箭齐发', desc: '自己本回合可一次投出三枚棋子' },
    { id: 'weiyu', name: '为所欲为', desc: '可指定一个技能施放（包括已使用过的技能）' },
    { id: 'muxuan', name: '目眩神迷', desc: '对手原地转五圈后再投棋' },
    { id: 'yihua', name: '移花接木', desc: '任意将对手一枚棋子变为己方' },
  ]
  
  // 触发技能动画
  const triggerSkillAnimation = useCallback((skillName) => {
    // 开始播放图片序列
    setPlayerSkillEffect({ skillName, imageIndex: 0 })
    
    // 0-0.6秒：显示第一张图片
    setTimeout(() => {
      setPlayerSkillEffect(prev => prev ? { ...prev, imageIndex: 1 } : null)
    }, 600)
    
    // 0.6-1.2秒：显示第二张图片
    setTimeout(() => {
      setPlayerSkillEffect(prev => prev ? { ...prev, imageIndex: 2 } : null)
    }, 1200)
    
    // 1.2-2秒：显示第三张图片
    setTimeout(() => {
      setPlayerSkillEffect(prev => prev ? { ...prev, imageIndex: 3 } : null)
    }, 2000)
    
    // 2秒后：显示技能名字，3秒后隐藏
    setTimeout(() => {
      setPlayerSkillEffect(null)
    }, 3000)
  }, [])

  // 保存历史记录到localStorage
  useEffect(() => {
    localStorage.setItem('gomoku-history', JSON.stringify(gameHistory))
  }, [gameHistory])

  // 同步ref
  useEffect(() => {
    if (boardRef.current === null) {
      boardRef.current = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    }
    boardRef.current = board
    isPlayerTurnRef.current = isPlayerTurn
  }, [board, isPlayerTurn])

  // 检查是否五子连珠，返回获胜的五子位置
  const checkWin = useCallback((boardState, row, col, player) => {
    const directions = [
      { dx: 0, dy: 1, name: 'horizontal' },   // 水平
      { dx: 1, dy: 0, name: 'vertical' },     // 垂直
      { dx: 1, dy: 1, name: 'diagonal1' },    // 主对角线
      { dx: 1, dy: -1, name: 'diagonal2' }    // 副对角线
    ]

    for (let { dx, dy } of directions) {
      const line = [{ row, col }] // 包括当前棋子

      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          boardState[newRow][newCol] === player
        ) {
          line.push({ row: newRow, col: newCol })
        } else {
          break
        }
      }

      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          boardState[newRow][newCol] === player
        ) {
          line.unshift({ row: newRow, col: newCol })
        } else {
          break
        }
      }

      if (line.length >= 5) {
        // 返回获胜的五子位置（取前5个）
        return line.slice(0, 5)
      }
    }

    return null
  }, [])

  // 评估位置分数（简单的AI算法）
  const evaluatePosition = useCallback((boardState, row, col, player) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ]
    let score = 0

    for (let [dx, dy] of directions) {
      let count = 1
      let blocked = 0

      // 正向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (boardState[newRow][newCol] === player) {
            count++
          } else if (boardState[newRow][newCol] !== EMPTY) {
            blocked++
            break
          } else {
            break
          }
        } else {
          blocked++
          break
        }
      }

      // 反向检查
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (boardState[newRow][newCol] === player) {
            count++
          } else if (boardState[newRow][newCol] !== EMPTY) {
            blocked++
            break
          } else {
            break
          }
        } else {
          blocked++
          break
        }
      }

      // 根据连子数和阻塞情况给分
      if (count >= 5) score += 100000
      else if (count === 4 && blocked === 0) score += 10000
      else if (count === 4 && blocked === 1) score += 1000
      else if (count === 3 && blocked === 0) score += 100
      else if (count === 3 && blocked === 1) score += 10
      else if (count === 2 && blocked === 0) score += 5
    }

    return score
  }, [])

  // AI下棋
  const makeAiMove = useCallback(() => {
    const currentBoard = boardRef.current
    const currentIsPlayerTurn = isPlayerTurnRef.current
    
    if (gameOver || currentIsPlayerTurn) return

    let bestMove = null
    const moves = []

    // 收集所有可能的下棋位置
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (currentBoard[row][col] === EMPTY) {
          // 检查是否在已有棋子附近（提高效率）
          let nearPiece = false
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = row + dr
              const nc = col + dc
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] !== EMPTY) {
                nearPiece = true
                break
              }
            }
            if (nearPiece) break
          }

          // 如果棋盘上有棋子，但当前位置不在附近，跳过
          const hasPieces = currentBoard.some(r => r.some(c => c !== EMPTY))
          if (hasPieces && !nearPiece) continue

          const attackScore = evaluatePosition(currentBoard, row, col, aiColor)
          const defenseScore = evaluatePosition(currentBoard, row, col, playerColor)
          const totalScore = attackScore * 2 + defenseScore

          moves.push({ row, col, score: totalScore })
        }
      }
    }

    // 如果棋盘为空，下在中心
    if (moves.length === BOARD_SIZE * BOARD_SIZE) {
      bestMove = { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) }
    } else if (moves.length > 0) {
      // 选择得分最高的位置，如果有多个相同分数，随机选择
      moves.sort((a, b) => b.score - a.score)
      const topScore = moves[0].score
      const topMoves = moves.filter(m => m.score === topScore)
      bestMove = topMoves[Math.floor(Math.random() * topMoves.length)]
    }

    if (bestMove) {
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(r => [...r])
        newBoard[bestMove.row][bestMove.col] = aiColor
        setLastMove({ row: bestMove.row, col: bestMove.col })
        
        // 检查AI是否获胜
        const winLine = checkWin(newBoard, bestMove.row, bestMove.col, aiColor)
        
        // 记录AI的走子并检查是否获胜
        setMoveHistory(prev => {
          const newHistory = [...prev, {
            row: bestMove.row,
            col: bestMove.col,
            player: 'AI',
            color: aiColor,
            moveNumber: prev.length + 1
          }]
          
          if (winLine) {
            // 保存游戏记录
            const record = {
              id: Date.now(),
              date: new Date().toLocaleString('zh-CN'),
              winner: 'AI',
              totalMoves: newHistory.length,
              moves: newHistory,
              playerColor: playerColor === BLACK ? '黑棋' : '白棋',
              aiColor: aiColor === BLACK ? '黑棋' : '白棋'
            }
            setGameHistory(prevHistory => [record, ...prevHistory].slice(0, 50))
            setGameOver(true)
            setWinner(aiColor)
            setWinningLine(winLine)
            setIsPlayerTurn(false)
          } else {
            setCurrentPlayer(playerColor)
            setIsPlayerTurn(true)
          }
          
          return newHistory
        })

        return newBoard
      })
    }
  }, [aiColor, playerColor, gameOver, checkWin, evaluatePosition])


  // 初始化游戏，随机决定先手
  useEffect(() => {
    const randomFirst = Math.random() > 0.5 ? BLACK : WHITE
    setPlayerColor(randomFirst)
    setAiColor(randomFirst === BLACK ? WHITE : BLACK)
    setCurrentPlayer(BLACK) // 总是黑棋先手
    setMoveHistory([])
    
    // 如果AI是黑棋，先下第一步
    if (randomFirst === BLACK) {
      setIsPlayerTurn(false)
      setTimeout(() => {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r])
          const centerRow = Math.floor(BOARD_SIZE / 2)
          const centerCol = Math.floor(BOARD_SIZE / 2)
          newBoard[centerRow][centerCol] = BLACK
          setLastMove({ row: centerRow, col: centerCol })
          setCurrentPlayer(WHITE)
          setIsPlayerTurn(true)
          setMoveHistory([{
            row: centerRow,
            col: centerCol,
            player: 'AI',
            color: BLACK,
            moveNumber: 1
          }])
          return newBoard
        })
      }, 500)
    } else {
      setIsPlayerTurn(true)
    }
  }, [])

  // 当轮到AI时自动下棋
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && currentPlayer === aiColor) {
      const timer = setTimeout(() => {
        makeAiMove()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, gameOver, currentPlayer, aiColor, makeAiMove])

  // 处理玩家点击棋盘
  const handleCellClick = useCallback((row, col) => {
    if (gameOver || !isPlayerTurn || board[row][col] !== EMPTY || currentPlayer !== playerColor) {
      return
    }

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(r => [...r])
      newBoard[row][col] = playerColor
      setLastMove({ row, col })
      
      // 检查玩家是否获胜
      const winLine = checkWin(newBoard, row, col, playerColor)
      
      // 记录玩家的走子并检查是否获胜
      setMoveHistory(prev => {
        const newHistory = [...prev, {
          row,
          col,
          player: '玩家',
          color: playerColor,
          moveNumber: prev.length + 1
        }]
        
        if (winLine) {
          // 保存游戏记录
          const record = {
            id: Date.now(),
            date: new Date().toLocaleString('zh-CN'),
            winner: '玩家',
            totalMoves: newHistory.length,
            moves: newHistory,
            playerColor: playerColor === BLACK ? '黑棋' : '白棋',
            aiColor: aiColor === BLACK ? '黑棋' : '白棋'
          }
          setGameHistory(prevHistory => [record, ...prevHistory].slice(0, 50))
          setGameOver(true)
          setWinner(playerColor)
          setWinningLine(winLine)
          setIsPlayerTurn(false)
        } else {
          // 切换到AI回合
          setCurrentPlayer(aiColor)
          setIsPlayerTurn(false)
        }
        
        return newHistory
      })

      return newBoard
    })
  }, [gameOver, isPlayerTurn, board, playerColor, aiColor, checkWin])

  // 重新开始游戏
  const handleReset = useCallback(() => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    setBoard(newBoard)
    setGameOver(false)
    setWinner(null)
    setLastMove(null)
    setWinningLine(null)
    setMoveHistory([])
    
    // 随机决定先手
    const randomFirst = Math.random() > 0.5 ? BLACK : WHITE
    setPlayerColor(randomFirst)
    setAiColor(randomFirst === BLACK ? WHITE : BLACK)
    setCurrentPlayer(BLACK)
    
    // 如果玩家是黑棋，玩家先手
    if (randomFirst === BLACK) {
      setIsPlayerTurn(true)
    } else {
      // 如果玩家是白棋，AI先手（因为AI是黑棋）
      setIsPlayerTurn(false)
      setTimeout(() => {
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r])
          const centerRow = Math.floor(BOARD_SIZE / 2)
          const centerCol = Math.floor(BOARD_SIZE / 2)
          newBoard[centerRow][centerCol] = BLACK
          setLastMove({ row: centerRow, col: centerCol })
          setCurrentPlayer(WHITE)
          setIsPlayerTurn(true)
          setMoveHistory([{
            row: centerRow,
            col: centerCol,
            player: 'AI',
            color: BLACK,
            moveNumber: 1
          }])
          return newBoard
        })
      }, 500)
    }
  }, [])

  // 清除历史记录
  const clearHistory = useCallback(() => {
    setGameHistory([])
    localStorage.removeItem('gomoku-history')
  }, [])

  // 判断是否是最后一步
  const isLastMove = useCallback((row, col) => {
    return lastMove && lastMove.row === row && lastMove.col === col
  }, [lastMove])

  // 计算获胜线的SVG坐标
  const getWinningLinePath = () => {
    if (!winningLine || winningLine.length < 2) return null
    
    const first = winningLine[0]
    const last = winningLine[winningLine.length - 1]
    
    // 计算交叉点的中心坐标（相对于棋盘）
    const x1 = first.col * CELL_SIZE + CELL_SIZE / 2
    const y1 = first.row * CELL_SIZE + CELL_SIZE / 2
    const x2 = last.col * CELL_SIZE + CELL_SIZE / 2
    const y2 = last.row * CELL_SIZE + CELL_SIZE / 2
    
    return { x1, y1, x2, y2 }
  }

  const linePath = getWinningLinePath()

  return (
    <div className="gomoku-game">
      <div className="gomoku-container">
        <div className="game-header">
          <h1 className="q-font-title">五子棋</h1>
          <div className="header-buttons">
            <button className="reset-button q-font-button" onClick={handleReset}>
              重新开始
            </button>
            <button className="history-button q-font-button" onClick={() => setShowHistory(!showHistory)}>
              历史记录
            </button>
            <button 
              className="test-skill-button q-font-button" 
              onClick={() => triggerSkillAnimation('飞沙走石')}
            >
              测试技能动画
            </button>
          </div>
        </div>

        <div className="game-info">
          {gameOver ? (
            <div className="winner-message q-font-text">
              <h2>
                {winner === playerColor ? '🎉 你获胜了！' : '😔 AI获胜！'}
              </h2>
            </div>
          ) : (
            <div className="current-player q-font-text">
              <div className={`player-indicator ${currentPlayer === BLACK ? 'black' : 'white'}`}>
                {currentPlayer === BLACK ? '●' : '○'}
              </div>
              <span>
                {isPlayerTurn 
                  ? `你的回合 (${playerColor === BLACK ? '黑棋' : '白棋'})`
                  : `AI思考中... (${aiColor === BLACK ? '黑棋' : '白棋'})`
                }
              </span>
            </div>
          )}
        </div>

        <div className="board-container">
          <div className="gomoku-board" style={{ position: 'relative' }}>
            {/* 玩家技能特效 - 图片序列动画 */}
            {playerSkillEffect && (
              <div className="player-skill-effect-overlay">
                <div className="skill-image-sequence">
                  {/* 图片1：卡包关闭状态 */}
                  <img 
                    src="/skill-anim-1.png" 
                    alt="技能动画1"
                    className={`skill-image skill-image-1 ${playerSkillEffect.imageIndex === 0 ? 'active' : ''}`}
                    onError={(e) => {
                      // 如果图片不存在，使用占位符
                      e.target.style.display = 'none'
                    }}
                  />
                  {/* 图片2：卡包半开状态 */}
                  <img 
                    src="/skill-anim-2.png" 
                    alt="技能动画2"
                    className={`skill-image skill-image-2 ${playerSkillEffect.imageIndex === 1 ? 'active' : ''}`}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  {/* 图片3：卡包完全打开 */}
                  <img 
                    src="/skill-anim-3.png" 
                    alt="技能动画3"
                    className={`skill-image skill-image-3 ${playerSkillEffect.imageIndex === 2 ? 'active' : ''}`}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  {/* 技能名字 - 最后显示 */}
                  {playerSkillEffect.imageIndex >= 3 && (
                    <div className="skill-name-display">{playerSkillEffect.skillName}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* 获胜线 SVG */}
            {gameOver && linePath && (
              <svg 
                className="winning-line"
                width={CELL_SIZE * BOARD_SIZE}
                height={CELL_SIZE * BOARD_SIZE}
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 3 }}
              >
                <defs>
                  <linearGradient id="winLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#FF6B6B" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <line
                  x1={linePath.x1}
                  y1={linePath.y1}
                  x2={linePath.x2}
                  y2={linePath.y2}
                  stroke="url(#winLineGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="8,4"
                  opacity="0.9"
                />
              </svg>
            )}
            
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`intersection ${isLastMove(rowIndex, colIndex) ? 'last-move' : ''}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== EMPTY && (
                      <div className={`stone ${cell === BLACK ? 'black' : 'white'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 历史记录面板 */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3 className="q-font-title">历史记录</h3>
              <button className="close-history q-font-button" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            {gameHistory.length === 0 ? (
              <div className="no-history q-font-text">暂无历史记录</div>
            ) : (
              <>
                <div className="history-list">
                  {gameHistory.map((record) => (
                    <div key={record.id} className="history-item q-font-text">
                      <div className="history-item-header">
                        <span className="history-date">{record.date}</span>
                        <span className={`history-winner ${record.winner === '玩家' ? 'player-win' : 'ai-win'}`}>
                          {record.winner === '玩家' ? '胜利' : '失败'}
                        </span>
                      </div>
                      <div className="history-item-details">
                        <span>总步数: {record.totalMoves}</span>
                        <span>玩家: {record.playerColor}</span>
                        <span>AI: {record.aiColor}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="clear-history-button q-font-button" onClick={clearHistory}>
                  清空历史
                </button>
              </>
            )}
          </div>
        )}

        <div className="game-rules q-font-text">
          <h3 className="q-font-title">游戏规则</h3>
          <ul>
            <li>黑棋先行，双方轮流在交叉点下棋</li>
            <li>先在横、竖、斜任意方向连成五子的一方获胜</li>
            <li>每局游戏随机决定先手</li>
            <li>你与AI对战</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default GomokuGame
