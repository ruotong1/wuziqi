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
  const [skillMode, setSkillMode] = useState(false) // 技能模式
  const [selectedSkill, setSelectedSkill] = useState(null) // 选中的技能
  const [waitingForSkillTarget, setWaitingForSkillTarget] = useState(false) // 等待选择目标
  const [skillTargetType, setSkillTargetType] = useState(null) // 目标类型
  const [showSkillPanel, setShowSkillPanel] = useState(false) // 显示技能面板
  const [usedSkills, setUsedSkills] = useState([]) // 已使用的技能
  const [activeSkillEffects, setActiveSkillEffects] = useState({
    playerSkipTurn: false, // 乐不思蜀：玩家本回合不可出棋
    aiSkipTurn: false, // 乐不思蜀：AI本回合不可出棋
    tripleMove: false, // 万箭齐发：本回合可下三子
    remainingMoves: 0, // 万箭齐发：剩余可下棋子数
  })
  const [skillFirstTarget, setSkillFirstTarget] = useState(null) // 技能目标选择状态（用于斗转星移的两步选择）
  const boardRef = useRef(board)
  const isPlayerTurnRef = useRef(isPlayerTurn)

  // 保存历史记录到localStorage
  useEffect(() => {
    localStorage.setItem('gomoku-history', JSON.stringify(gameHistory))
  }, [gameHistory])

  // 同步ref
  useEffect(() => {
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

  // AI使用技能
  const aiUseSkill = useCallback(() => {
    if (!skillMode || gameOver || usedSkills.length >= 12) return false

    // AI有30%的概率使用技能
    if (Math.random() > 0.3) return false

    // 获取可用的技能（排除已使用的，除非是"为所欲为"）
    const availableSkills = skills.filter(skill => !usedSkills.includes(skill.id) || skill.id === 'weiyu')
    if (availableSkills.length === 0) return false

    // 随机选择一个技能
    const selectedSkillId = availableSkills[Math.floor(Math.random() * availableSkills.length)].id

    // 根据技能类型执行
    switch (selectedSkillId) {
      case 'feisha': // 飞沙走石：移除玩家棋子
        const playerPieces = []
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === playerColor) {
              playerPieces.push({ row, col })
            }
          }
        }
        if (playerPieces.length > 0) {
          const target = playerPieces[Math.floor(Math.random() * playerPieces.length)]
          executeSkill(selectedSkillId, target.row, target.col)
          return true
        }
        break

      case 'liangji': // 两极反转：直接执行
        executeSkill(selectedSkillId)
        return true

      case 'wuzhong': // 无中生有：在有利位置放置
        const emptySpots = []
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === EMPTY) {
              const score = evaluatePosition(board, row, col, aiColor)
              if (score > 50) {
                emptySpots.push({ row, col, score })
              }
            }
          }
        }
        if (emptySpots.length > 0) {
          emptySpots.sort((a, b) => b.score - a.score)
          const target = emptySpots[0]
          executeSkill(selectedSkillId, target.row, target.col)
          return true
        }
        break

      case 'tiaohu': // 调虎离山：移除玩家棋子
        const playerPieces2 = []
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === playerColor) {
              playerPieces2.push({ row, col })
            }
          }
        }
        if (playerPieces2.length > 0) {
          const target = playerPieces2[Math.floor(Math.random() * playerPieces2.length)]
          executeSkill(selectedSkillId, target.row, target.col)
          return true
        }
        break

      case 'liba': // 力拔山兮：直接执行
        executeSkill(selectedSkillId)
        return true

      case 'lebu': // 乐不思蜀：直接执行
        executeSkill(selectedSkillId)
        return true

      case 'wanjian': // 万箭齐发：直接执行
        executeSkill(selectedSkillId)
        return true

      case 'yihua': // 移花接木：将玩家棋子变为AI
        const playerPieces3 = []
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === playerColor) {
              playerPieces3.push({ row, col })
            }
          }
        }
        if (playerPieces3.length > 0) {
          const target = playerPieces3[Math.floor(Math.random() * playerPieces3.length)]
          executeSkill(selectedSkillId, target.row, target.col)
          return true
        }
        break

      default:
        break
    }
    return false
  }, [skillMode, gameOver, usedSkills, board, playerColor, aiColor, executeSkill, evaluatePosition, skills])

  // AI下棋
  const makeAiMove = useCallback(() => {
    const currentBoard = boardRef.current
    const currentIsPlayerTurn = isPlayerTurnRef.current
    
    if (gameOver || currentIsPlayerTurn) return

    // 检查乐不思蜀效果
    if (activeSkillEffects.aiSkipTurn) {
      alert('AI中了乐不思蜀，本回合不能出棋！哈哈哈哈哈！')
      setActiveSkillEffects(prev => ({ ...prev, aiSkipTurn: false }))
      setCurrentPlayer(playerColor)
      setIsPlayerTurn(true)
      return
    }

    // 如果技能模式开启，AI可能先使用技能（30%概率）
    if (skillMode && Math.random() < 0.3) {
      const skillUsed = aiUseSkill()
      if (skillUsed) {
        // 技能使用后，延迟500ms再下棋
        setTimeout(() => {
          makeAiMove()
        }, 500)
        return
      }
    }

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
  }, [aiColor, playerColor, gameOver, checkWin, evaluatePosition, activeSkillEffects, skillMode, aiUseSkill])


  // 初始化游戏，随机决定先手
  useEffect(() => {
    const randomFirst = Math.random() > 0.5 ? BLACK : WHITE
    setPlayerColor(randomFirst)
    setAiColor(randomFirst === BLACK ? WHITE : BLACK)
    setCurrentPlayer(BLACK) // 总是黑棋先手
    setMoveHistory([])
    
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

  // 当轮到AI时自动下棋
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && currentPlayer === aiColor) {
      const timer = setTimeout(() => {
        makeAiMove()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, gameOver, currentPlayer, aiColor, makeAiMove])

  // 执行技能
  const executeSkill = useCallback((skillId, targetRow = null, targetCol = null, targetRow2 = null, targetCol2 = null) => {
    setWaitingForSkillTarget(false)
    setSkillTargetType(null)
    setUsedSkills(prev => [...prev, skillId])

    switch (skillId) {
      case 'feisha': // 飞沙走石：移除对手棋子
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = EMPTY
            }
            return newBoard
          })
        }
        break

      case 'liangji': // 两极反转：双方棋子互换
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r])
          for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
              if (newBoard[row][col] === BLACK) {
                newBoard[row][col] = WHITE
              } else if (newBoard[row][col] === WHITE) {
                newBoard[row][col] = BLACK
              }
            }
          }
          return newBoard
        })
        // 同时交换玩家和AI的颜色，并立即更新currentPlayer
        setPlayerColor(prev => {
          const newColor = prev === BLACK ? WHITE : BLACK
          // 使用函数形式更新，避免闭包问题
          setTimeout(() => setCurrentPlayer(newColor), 0)
          return newColor
        })
        setAiColor(prev => prev === BLACK ? WHITE : BLACK)
        break

      case 'wuzhong': // 无中生有：在任意位置放置己方棋子
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === EMPTY) {
              newBoard[targetRow][targetCol] = playerColor
              return newBoard
            }
            return prevBoard
          })
        }
        break

      case 'douzhuan': // 斗转星移：移动对手棋子
        if (targetRow !== null && targetCol !== null && targetRow2 !== null && targetCol2 !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === aiColor && newBoard[targetRow2][targetCol2] === EMPTY) {
              newBoard[targetRow2][targetCol2] = aiColor
              newBoard[targetRow][targetCol] = EMPTY
            }
            return newBoard
          })
        }
        break

      case 'tiaohu': // 调虎离山：移除对手棋子
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = EMPTY
            }
            return newBoard
          })
        }
        break

      case 'liba': // 力拔山兮：清除对手所有棋子
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r])
          for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
              if (newBoard[row][col] === aiColor) {
                newBoard[row][col] = EMPTY
              }
            }
          }
          return newBoard
        })
        break

      case 'lebu': // 乐不思蜀：对手本回合不可出棋
        setActiveSkillEffects(prev => ({
          ...prev,
          aiSkipTurn: true
        }))
        break

      case 'shumu': // 鼠目寸光：标记（视觉效果，不影响逻辑）
        // 这个技能主要是视觉标记，实际效果在AI下棋时体现
        break

      case 'wanjian': // 万箭齐发：本回合可下三子
        setActiveSkillEffects(prev => ({
          ...prev,
          tripleMove: true,
          remainingMoves: 3
        }))
        break

      case 'muxuan': // 目眩神迷：标记（视觉效果）
        // 这个技能主要是视觉标记，实际效果在AI下棋时体现
        break

      case 'yihua': // 移花接木：将对手棋子变为己方
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = playerColor
            }
            return newBoard
          })
        }
        break

      default:
        break
    }

    setSelectedSkill(null)
  }, [playerColor, aiColor])

  // 处理技能目标选择
  const handleSkillTargetClick = useCallback((row, col) => {
    if (!waitingForSkillTarget || !selectedSkill) return

    switch (selectedSkill) {
      case 'feisha': // 飞沙走石：选择对手棋子
        if (board[row][col] === aiColor) {
          executeSkill(selectedSkill, row, col)
        }
        break

      case 'wuzhong': // 无中生有：选择空位置
        if (board[row][col] === EMPTY) {
          executeSkill(selectedSkill, row, col)
        }
        break

      case 'douzhuan': // 斗转星移：先选对手棋子，再选目标位置
        if (!skillFirstTarget) {
          if (board[row][col] === aiColor) {
            setSkillFirstTarget({ row, col })
          }
        } else {
          if (board[row][col] === EMPTY) {
            executeSkill(selectedSkill, skillFirstTarget.row, skillFirstTarget.col, row, col)
            setSkillFirstTarget(null)
          }
        }
        break

      case 'tiaohu': // 调虎离山：选择对手棋子
        if (board[row][col] === aiColor) {
          executeSkill(selectedSkill, row, col)
        }
        break

      case 'yihua': // 移花接木：选择对手棋子
        if (board[row][col] === aiColor) {
          executeSkill(selectedSkill, row, col)
        }
        break

      default:
        break
    }
  }, [waitingForSkillTarget, selectedSkill, board, aiColor, executeSkill, skillFirstTarget])

  // 处理玩家点击棋盘
  const handleCellClick = useCallback((row, col) => {
    // 如果正在等待技能目标选择，优先处理技能目标
    if (waitingForSkillTarget) {
      handleSkillTargetClick(row, col)
      return
    }

    // 检查乐不思蜀效果
    if (activeSkillEffects.playerSkipTurn && isPlayerTurn) {
      alert('哈哈哈哈哈！你中了乐不思蜀，本回合不能出棋！')
      setActiveSkillEffects(prev => ({ ...prev, playerSkipTurn: false }))
      setCurrentPlayer(aiColor)
      setIsPlayerTurn(false)
      return
    }

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
          // 处理万箭齐发效果
          if (activeSkillEffects.tripleMove && activeSkillEffects.remainingMoves > 1) {
            setActiveSkillEffects(prev => ({
              ...prev,
              remainingMoves: prev.remainingMoves - 1
            }))
            // 继续玩家回合
            setCurrentPlayer(playerColor)
            setIsPlayerTurn(true)
          } else {
            // 清除万箭齐发效果
            if (activeSkillEffects.tripleMove) {
              setActiveSkillEffects(prev => ({
                ...prev,
                tripleMove: false,
                remainingMoves: 0
              }))
            }
            // 切换到AI回合
            setCurrentPlayer(aiColor)
            setIsPlayerTurn(false)
          }
        }
        
        return newHistory
      })

      return newBoard
    })
  }, [gameOver, isPlayerTurn, board, playerColor, aiColor, checkWin, waitingForSkillTarget, handleSkillTargetClick, activeSkillEffects])

  // 切换技能模式
  const toggleSkillMode = useCallback(() => {
    const newSkillMode = !skillMode
    setSkillMode(newSkillMode)
    setShowSkillPanel(newSkillMode)
    if (!newSkillMode) {
      setSelectedSkill(null)
      setWaitingForSkillTarget(false)
      setSkillTargetType(null)
      setSkillFirstTarget(null)
    }
  }, [skillMode])

  // 选择技能
  const handleSelectSkill = useCallback((skillId) => {
    setSelectedSkill(skillId)
    setShowSkillPanel(false)

    // 根据技能类型设置等待目标状态
    switch (skillId) {
      case 'feisha': // 飞沙走石：选择对手棋子
        setWaitingForSkillTarget(true)
        setSkillTargetType('remove_opponent')
        break
      case 'wuzhong': // 无中生有：选择放置位置
        setWaitingForSkillTarget(true)
        setSkillTargetType('place_anywhere')
        break
      case 'douzhuan': // 斗转星移：先选对手棋子，再选目标位置
        setWaitingForSkillTarget(true)
        setSkillTargetType('move_piece')
        break
      case 'tiaohu': // 调虎离山：选择对手棋子
        setWaitingForSkillTarget(true)
        setSkillTargetType('remove_opponent')
        break
      case 'yihua': // 移花接木：选择对手棋子
        setWaitingForSkillTarget(true)
        setSkillTargetType('transform_piece')
        break
      case 'liangji': // 两极反转：直接执行
        executeSkill(skillId)
        break
      case 'liba': // 力拔山兮：直接执行
        executeSkill(skillId)
        break
      case 'lebu': // 乐不思蜀：直接执行
        executeSkill(skillId)
        break
      case 'shumu': // 鼠目寸光：直接执行（下一回合生效）
        executeSkill(skillId)
        break
      case 'wanjian': // 万箭齐发：直接执行
        executeSkill(skillId)
        break
      case 'weiyu': // 为所欲为：重新打开技能面板
        setShowSkillPanel(true)
        setSelectedSkill(null)
        break
      case 'muxuan': // 目眩神迷：直接执行（下一回合生效）
        executeSkill(skillId)
        break
      default:
        break
    }
  }, [executeSkill])

  // 重新开始游戏
  const handleReset = useCallback(() => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    setBoard(newBoard)
    setGameOver(false)
    setWinner(null)
    setLastMove(null)
    setWinningLine(null)
    setMoveHistory([])
    setSelectedSkill(null)
    setWaitingForSkillTarget(false)
    setSkillTargetType(null)
    setSkillFirstTarget(null)
    setUsedSkills([])
    setActiveSkillEffects({
      playerSkipTurn: false,
      aiSkipTurn: false,
      tripleMove: false,
      remainingMoves: 0,
    })
    
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

  // 计算获胜线的SVG坐标（精确从第一个子中心到最后一个子中心）
  const getWinningLinePath = () => {
    if (!winningLine || winningLine.length < 5) return null
    
    // 确保使用前5个元素（checkWin返回的slice(0, 5)）
    const line = winningLine.slice(0, 5)
    const first = line[0]
    const last = line[line.length - 1]
    
    // SVG坐标系统：x是水平方向（对应col），y是垂直方向（对应row）
    // 计算第一个和最后一个点的中心坐标（精确对齐棋子中心）
    // 注意：board[row][col]，所以col对应x（水平），row对应y（垂直）
    const x1 = first.col * CELL_SIZE + CELL_SIZE / 2
    const y1 = first.row * CELL_SIZE + CELL_SIZE / 2
    const x2 = last.col * CELL_SIZE + CELL_SIZE / 2
    const y2 = last.row * CELL_SIZE + CELL_SIZE / 2
    
    return { x1, y1, x2, y2 }
  }

  const linePath = getWinningLinePath()

  return (
    <div className="gomoku-game">
      {/* 背景装饰星星 */}
      <div className="background-sparkles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={`sparkle-bg-${i}`} className={`sparkle-bg sparkle-bg-${i + 1}`}>✦</div>
        ))}
      </div>
      <div className="gomoku-container">
        <div className="game-header">
          <div className="header-buttons">
            <button 
              className={`ai-generate-button ${skillMode ? 'active' : ''}`} 
              onClick={toggleSkillMode}
            >
              技能五子棋
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
            <div className="current-player">
              <div className={`player-indicator ${currentPlayer === BLACK ? 'black' : 'white'}`}></div>
              <span>
                {isPlayerTurn 
                  ? `你的回合 (${playerColor === BLACK ? '黑棋' : '白棋'})`
                  : `AI思考中... (${aiColor === BLACK ? '黑棋' : '白棋'})`
                }
              </span>
            </div>
          )}
        </div>

        {/* 星星装饰 */}
        <div className="stars-decoration">
          <div className="sparkle sparkle-1">✦</div>
          <div className="sparkle sparkle-2">✦</div>
          <div className="sparkle sparkle-3">✦</div>
          <div className="sparkle sparkle-4">✦</div>
          <div className="sparkle sparkle-5">✦</div>
          <div className="star star-left">★</div>
          <div className="star star-center">★</div>
          <div className="star star-right">★</div>
          <div className="sparkle sparkle-6">✦</div>
          <div className="sparkle sparkle-7">✦</div>
          <div className="sparkle sparkle-8">✦</div>
        </div>

        <div className="board-container">
          <div className="gomoku-board" style={{ position: 'relative' }}>
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="board-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`intersection ${isLastMove(rowIndex, colIndex) ? 'last-move' : ''} ${
                      waitingForSkillTarget && (
                        (selectedSkill === 'feisha' && cell === aiColor) ||
                        (selectedSkill === 'wuzhong' && cell === EMPTY) ||
                        (selectedSkill === 'douzhuan' && (!skillFirstTarget ? cell === aiColor : cell === EMPTY)) ||
                        (selectedSkill === 'tiaohu' && cell === aiColor) ||
                        (selectedSkill === 'yihua' && cell === aiColor)
                      ) ? 'skill-target' : ''
                    }`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== EMPTY && (
                      <div className={`stone ${cell === BLACK ? 'black' : 'white'} ${gameOver && winningLine && winningLine.some(p => p.row === rowIndex && p.col === colIndex) ? 'winning' : ''}`}></div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 技能面板 */}
        {showSkillPanel && (
          <div className="skill-panel">
            <div className="skill-header">
              <h3>选择技能</h3>
              <button className="close-skill q-font-button" onClick={() => setShowSkillPanel(false)}>✕</button>
            </div>
            <div className="skill-list">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  className={`skill-button ${usedSkills.includes(skill.id) && selectedSkill !== 'weiyu' ? 'used' : ''}`}
                  onClick={() => handleSelectSkill(skill.id)}
                  disabled={usedSkills.includes(skill.id) && selectedSkill !== 'weiyu'}
                >
                  <div className="skill-name">{skill.name}</div>
                  <div className="skill-desc">{skill.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 技能使用提示 */}
        {waitingForSkillTarget && (
          <div className="skill-hint">
            {selectedSkill === 'douzhuan' && !skillFirstTarget ? (
              <div>请选择要移动的对手棋子</div>
            ) : selectedSkill === 'douzhuan' && skillFirstTarget ? (
              <div>请选择目标位置</div>
            ) : (
              <div>请选择目标位置</div>
            )}
            <button className="cancel-skill" onClick={() => {
              setWaitingForSkillTarget(false)
              setSkillTargetType(null)
              setSelectedSkill(null)
              setSkillFirstTarget(null)
            }}>取消</button>
          </div>
        )}

        {/* 历史记录面板 */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>历史记录</h3>
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
                          {record.winner === '玩家' ? '🎉 玩家获胜' : '🤖 AI获胜'}
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

        <div className="game-footer">
          <div className="footer-bar">
            <div className="piece-indicators">
              <div className="piece-indicator white"></div>
              <div className="piece-indicator white"></div>
              <div className="piece-indicator black"></div>
              <div className="piece-indicator black"></div>
              <div className="piece-indicator black"></div>
            </div>
            <div className="footer-icons">
              <div className="footer-icon plus">+</div>
              <div className="footer-icon circle">○</div>
            </div>
          </div>
          <div className="footer-buttons">
            <button className="start-button" onClick={handleReset}>
              开始
            </button>
            <button className="settings-button" onClick={() => setShowHistory(!showHistory)}>
              历史记录
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}

export default GomokuGame
