import React, { useState, useEffect, useCallback, useRef } from 'react'
import './GomokuGame.css'

// Canvas 技能动画组件
const SkillCanvasAnimation = ({ skillName, onComplete }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const frameRate = 200 // 每帧间隔200ms（控制播放速度）

  // 技能图片帧数组
  const skillFrames = [
    '/skill-anim-1.png',
    '/skill-anim-2.png',
    '/skill-anim-3.png'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const frameCount = skillFrames.length
    let loadedCount = 0

    // 加载所有图片
    const loadImages = () => {
      return new Promise((resolve) => {
        skillFrames.forEach((url, index) => {
          const img = new Image()
          img.onload = () => {
            loadedCount++
            if (loadedCount === frameCount) {
              resolve()
            }
          }
          img.onerror = () => {
            // 图片加载失败时使用占位符
            loadedCount++
            if (loadedCount === frameCount) {
              resolve()
            }
          }
          img.src = url
          imagesRef.current[index] = img
        })
      })
    }

    // 绘制当前帧
    const drawFrame = (frameIndex) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const img = imagesRef.current[frameIndex]
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
    }

    // 播放动画
    const playAnimation = async () => {
      await loadImages()
      
      currentFrameRef.current = 0
      drawFrame(0)

      animationRef.current = setInterval(() => {
        currentFrameRef.current++
        if (currentFrameRef.current < frameCount) {
          drawFrame(currentFrameRef.current)
        } else {
          // 动画播放完成
          clearInterval(animationRef.current)
          // 显示技能名字
          setTimeout(() => {
            if (onComplete) onComplete()
          }, 500)
        }
      }, frameRate)
    }

    playAnimation()

    // 清理函数
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [skillName, onComplete])

  return (
    <div className="skill-canvas-container">
      <canvas 
        ref={canvasRef}
        width={450}
        height={450}
        className="skill-canvas"
      />
      {/* 技能名字显示 */}
      <div className="skill-name-display">{skillName}</div>
    </div>
  )
}

const BOARD_SIZE = 15
const EMPTY = 0
const BLACK = 1
const WHITE = 2
const CELL_SIZE = 36 // 每个交叉点的大小（增大以方便点击）

// 预设随机头像列表
const RANDOM_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=default1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=default2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=default3',
  'https://api.dicebear.com/7.x/personas/svg?seed=default4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=default5',
  'https://api.dicebear.com/7.x/bottts/svg?seed=default6',
  'https://api.dicebear.com/7.x/personas/svg?seed=default7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=default8',
  'https://api.dicebear.com/7.x/bottts/svg?seed=default9',
  'https://api.dicebear.com/7.x/personas/svg?seed=default10',
]

// 随机选择头像函数
const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * RANDOM_AVATARS.length)
  return RANDOM_AVATARS[randomIndex]
}

// 默认AI配置（头像将在初始化时随机选择）
const getDefaultAI = (avatar) => ({
  id: 'default',
  name: '默认AI助手',
  avatar: avatar || getRandomAvatar(),
  description: '本地AI助手，无需API即可聊天',
  primary_desc: '本地AI助手，无需API即可聊天',
  secondary_desc: '随时可用，无需配置'
})

// 解析坐标格式 (x,y) 或 (x, y)
const parseCoordinate = (message) => {
  const match = message.match(/\((\d+)\s*,\s*(\d+)\)/)
  if (match) {
    const x = parseInt(match[1])
    const y = parseInt(match[2])
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      return { x, y, row: y, col: x } // 注意：棋盘是row,col，坐标是x,y
    }
  }
  return null
}

// 检查聊天棋盘是否五连
const checkChatWin = (boardState, row, col, player) => {
  const directions = [
    { dx: 0, dy: 1 },   // 水平
    { dx: 1, dy: 0 },     // 垂直
    { dx: 1, dy: 1 },    // 主对角线
    { dx: 1, dy: -1 }    // 副对角线
  ]

  for (let { dx, dy } of directions) {
    let count = 1

    // 正向检查
    for (let i = 1; i < 5; i++) {
      const newRow = row + dx * i
      const newCol = col + dy * i
      if (
        newRow >= 0 && newRow < BOARD_SIZE &&
        newCol >= 0 && newCol < BOARD_SIZE &&
        boardState[newRow][newCol] === player
      ) {
        count++
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
        count++
      } else {
        break
      }
    }

    if (count >= 5) {
      return true
    }
  }

  return false
}

// 简单的AI落子评估（用于聊天对弈）
const evaluateChatPosition = (boardState, row, col, player) => {
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
}

// 计算AI的落子位置
const calculateAIMove = (boardState, aiColor, playerColor) => {
  const moves = []

  // 收集所有可能的下棋位置
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (boardState[row][col] === EMPTY) {
        const attackScore = evaluateChatPosition(boardState, row, col, aiColor)
        const defenseScore = evaluateChatPosition(boardState, row, col, playerColor)
        const totalScore = attackScore * 2 + defenseScore
        moves.push({ row, col, score: totalScore })
      }
    }
  }

  if (moves.length === 0) return null

  // 选择得分最高的位置
  moves.sort((a, b) => b.score - a.score)
  const topScore = moves[0].score
  const topMoves = moves.filter(m => m.score === topScore)
  return topMoves[Math.floor(Math.random() * topMoves.length)]
}

// 默认AI本地模拟回复函数（五子棋对弈版）
const getDefaultAIReply = (userMessage, recentReplies = [], chatBoardState, chatPlayerColor, chatAIColor, chatGameOver, setChatBoardState, setChatGameOver, setChatWinner, setChatMoveHistory) => {
  const lowerMessage = userMessage.toLowerCase().trim()
  
  // 如果游戏已结束，提示重新开始
  if (chatGameOver) {
    if (lowerMessage.includes('重新') || lowerMessage.includes('再来') || lowerMessage.includes('开始')) {
      // 重置棋盘
      const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
      setChatBoardState(newBoard)
      setChatGameOver(false)
      setChatWinner(null)
      setChatMoveHistory([])
      return '好的，让我们重新开始一局五子棋吧！'
    }
    return '游戏已经结束了，如果想重新开始，请说"重新开始"或"再来一局"。'
  }

  // 解析用户输入的坐标
  const userMove = parseCoordinate(userMessage)
  
  if (userMove) {
    // 用户输入了坐标格式
    const { row, col } = userMove
    
    // 检查位置是否有效
    if (chatBoardState[row][col] !== EMPTY) {
      return `你选择的位置 (${userMove.x},${userMove.y}) 已经有棋子了，请换一个坐标~`
    }
    
    // 用户落子
    const newBoard = chatBoardState.map(r => [...r])
    newBoard[row][col] = chatPlayerColor
    setChatMoveHistory(prev => [...prev, { row, col, player: 'user', color: chatPlayerColor }])
    
    // 检查用户是否获胜
    if (checkChatWin(newBoard, row, col, chatPlayerColor)) {
      setChatBoardState(newBoard)
      setChatGameOver(true)
      setChatWinner(chatPlayerColor)
      const styles = [
        `恭喜你！成功连成5颗黑棋，你赢啦！这局你下得很棒！`,
        `哈哈，你赢了！连成5颗黑棋，这局我输了，要不要再来一局？`,
        `太厉害了！你成功连成5颗，这局你胜！`
      ]
      return styles[Math.floor(Math.random() * styles.length)]
    }
    
    // AI计算落子
    const aiMove = calculateAIMove(newBoard, chatAIColor, chatPlayerColor)
    
    if (!aiMove) {
      // 棋盘已满，平局
      setChatBoardState(newBoard)
      setChatGameOver(true)
      setChatWinner(null)
      return '棋盘已经下满啦，这局是平局！双方棋艺相当，太精彩了~'
    }
    
    // AI落子
    newBoard[aiMove.row][aiMove.col] = chatAIColor
    setChatMoveHistory(prev => [...prev, { row: aiMove.row, col: aiMove.col, player: 'ai', color: chatAIColor }])
    
    // 检查AI是否获胜
    let aiWon = false
    if (checkChatWin(newBoard, aiMove.row, aiMove.col, chatAIColor)) {
      aiWon = true
      setChatGameOver(true)
      setChatWinner(chatAIColor)
    }
    
    setChatBoardState(newBoard)
    
    // 生成回复（随机选择风格）
    const style = Math.floor(Math.random() * 4)
    const aiPos = `(${aiMove.col},${aiMove.row})`
    
    if (aiWon) {
      const winReplies = [
        `哈哈，我先连成5颗白棋，这局我胜！要不要再来一局？`,
        `我落子在 **${aiPos}**，成功连成5颗，这局我赢了！`,
        `我在 ${aiPos} 落子，连成5颗白棋，这局我胜！`
      ]
      return winReplies[Math.floor(Math.random() * winReplies.length)]
    }
    
    // 根据风格生成回复
    switch (style) {
      case 0: // 新手友好型
        return `我落子在 **${aiPos}**~\n局面分析：你在 (${userMove.x},${userMove.y}) 下了黑棋；我在 ${aiPos} 落子，暂时不会让你快速连成线哦。\n目前还没分出胜负，你可以继续选一个位置落子，比如试试 (${aiMove.col + 1},${aiMove.row}) 或者 (${aiMove.col},${aiMove.row + 1}) 呀~`
      
      case 1: // 策略分析型
        return `我的落子位置：**${aiPos}**\n局面分析：你执黑在 (${userMove.x},${userMove.y}) 落子；我选择 ${aiPos} 落子，既考虑防守也寻找进攻机会。\n胜负未分，请你落子，建议关注对角线方向的点位布局。`
      
      case 2: // 趣味调侃型
        return `嘿嘿，我选 **${aiPos}** 这个位置！\n局面分析：你在 (${userMove.x},${userMove.y}) 下了黑棋，可惜被我在 ${aiPos} 卡位啦，想三连？没那么容易~\n现在棋盘还有空间，快选个位置反击我，别怂！`
      
      case 3: // 严谨竞技型
        return `落子：**${aiPos}**\n局面分析：黑棋 (${userMove.x},${userMove.y}) 落子，白棋 ${aiPos} 对位。\n未分胜负，请出棋。`
      
      default:
        return `我落子在 ${aiPos}，请继续。`
    }
  }
  
  // 非坐标格式的回复 - 改为友好自然的对话
  if (lowerMessage.includes('你好') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    const greetings = [
      '你好！我是五子棋对弈AI，准备好和我下棋了吗？',
      '你好呀！让我们开始下五子棋吧！',
      '嗨！很高兴和你一起下五子棋~'
    ]
    return getNonRepeatingReply(greetings, recentReplies)
  }
  
  if (lowerMessage.includes('下棋') || lowerMessage.includes('游戏') || lowerMessage.includes('五子棋') || lowerMessage.includes('开始')) {
    // 重置棋盘
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    setChatBoardState(newBoard)
    setChatGameOver(false)
    setChatWinner(null)
    setChatMoveHistory([])
    const startReplies = [
      '好的，让我们开始下五子棋吧！你执黑先手，我执白。',
      '太好了！新的一局开始啦~你执黑，我执白。',
      '让我们开始吧！你执黑先手哦~'
    ]
    return getNonRepeatingReply(startReplies, recentReplies)
  }
  
  // 其他非坐标格式的回复 - 改为友好自然的对话
  const friendlyReplies = [
    '我在等你落子呢~',
    '该你下棋了！',
    '轮到你啦~',
    '我在思考下一步呢，该你下棋了！',
    '该你出招了！',
    '我在等你呢~',
    '该你下棋啦！',
    '轮到你出棋了~',
    '我在思考中，该你下棋了！',
    '该你出招啦~'
  ]
  return getNonRepeatingReply(friendlyReplies, recentReplies)
}

// 辅助函数：从回复列表中选择一个不与最近回复重复的回复
const getNonRepeatingReply = (replies, recentReplies = []) => {
  if (!replies || replies.length === 0) return ''
  
  // 过滤掉与最近5条回复相同的选项（增加检查范围）
  const recentSet = new Set(recentReplies.slice(-5))
  const availableReplies = replies.filter(reply => !recentSet.has(reply))
  
  // 如果所有选项都被过滤掉了，使用所有选项（确保总是能返回一个）
  const finalReplies = availableReplies.length > 0 ? availableReplies : replies
  
  // 随机选择一个
  const randomIndex = Math.floor(Math.random() * finalReplies.length)
  return finalReplies[randomIndex]
}

const GomokuGame = () => {
  const [board, setBoard] = useState(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
  )
  const [currentPlayer, setCurrentPlayer] = useState(BLACK)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
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
  const [aiSkillEffect, setAiSkillEffect] = useState(null) // AI技能特效：{ skillName, position }
  const [playerSkillEffect, setPlayerSkillEffect] = useState(null) // 玩家技能特效：{ skillName }
  const [aiUsingWanjian, setAiUsingWanjian] = useState(false) // AI正在使用万箭齐发
  
  // 聊天相关状态
  const [selectedBot, setSelectedBot] = useState(() => {
    // 从localStorage加载选中的bot
    const saved = localStorage.getItem('selected-bot')
    return saved ? JSON.parse(saved) : null
  })
  const [useDefaultAI, setUseDefaultAI] = useState(() => {
    // 从localStorage加载是否使用默认AI
    const saved = localStorage.getItem('use-default-ai')
    return saved === 'true'
  })
  const [chatMessages, setChatMessages] = useState(() => {
    // 如果有选中的bot，初始化欢迎消息
    const saved = localStorage.getItem('selected-bot')
    if (saved) {
      const bot = JSON.parse(saved)
      return [{
        type: 'system',
        content: `已连接到 ${bot.name}，开始聊天吧！`,
        timestamp: new Date()
      }]
    }
    return []
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  
  // 聊天对弈棋盘状态（独立于游戏棋盘）
  const [chatBoard, setChatBoard] = useState(() => 
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
  )
  const [chatPlayerColor, setChatPlayerColor] = useState(BLACK) // 用户在聊天中执黑
  const [chatAIColor, setChatAIColor] = useState(WHITE) // AI在聊天中执白
  const [chatGameOver, setChatGameOver] = useState(false)
  const [chatWinner, setChatWinner] = useState(null)
  const [chatMoveHistory, setChatMoveHistory] = useState([])
  
  const boardRef = useRef(board)
  const isPlayerTurnRef = useRef(isPlayerTurn)
  const playerColorRef = useRef(playerColor)

  // 保存历史记录到localStorage
  useEffect(() => {
    localStorage.setItem('gomoku-history', JSON.stringify(gameHistory))
  }, [gameHistory])

  // 保存选中的bot到localStorage
  useEffect(() => {
    if (selectedBot) {
      localStorage.setItem('selected-bot', JSON.stringify(selectedBot))
    } else {
      localStorage.removeItem('selected-bot')
    }
  }, [selectedBot])

  // 保存是否使用默认AI到localStorage
  useEffect(() => {
    localStorage.setItem('use-default-ai', useDefaultAI.toString())
  }, [useDefaultAI])

  // 组件挂载时自动启用默认AI
  useEffect(() => {
    // 如果localStorage中没有选中的bot，自动启用默认AI
    if (!selectedBot) {
      // 检查localStorage中是否保存了默认AI的头像
      const savedDefaultAvatar = localStorage.getItem('default-ai-avatar')
      let avatar = savedDefaultAvatar
      
      // 如果没有保存的头像，随机选择一个并保存
      if (!avatar) {
        avatar = getRandomAvatar()
        localStorage.setItem('default-ai-avatar', avatar)
      }
      
      // 创建默认AI实例
      const defaultAI = getDefaultAI(avatar)
      setSelectedBot(defaultAI)
      setUseDefaultAI(true)
      setChatMessages([{
        type: 'system',
        content: `已连接到 ${defaultAI.name}，开始聊天吧！`,
        timestamp: new Date()
      }])
    } else if (selectedBot.id === 'default') {
      // 如果已选择默认AI，确保useDefaultAI为true
      setUseDefaultAI(true)
    }
  }, [])


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

  // 执行技能（必须在aiUseSkill之前定义）
  const executeSkill = useCallback((skillId, targetRow = null, targetCol = null, targetRow2 = null, targetCol2 = null, isPlayer = true) => {
    setWaitingForSkillTarget(false)
    setSkillTargetType(null)
    
    // 如果当前选中的是"为所欲为"，不标记技能为已使用（因为"为所欲为"已经用过了）
    const isWeiyuSkill = selectedSkill === 'weiyu'
    if (!isWeiyuSkill) {
      setUsedSkills(prev => {
        // 避免重复添加
        if (prev.includes(skillId)) return prev
        return [...prev, skillId]
      })
    }
    
    // 清除"为所欲为"的选中状态
    if (isWeiyuSkill) {
      setSelectedSkill(null)
    }

    // 如果是玩家使用的技能，显示特效
    if (isPlayer) {
      const skill = skills.find(s => s.id === skillId)
      if (skill) {
        setPlayerSkillEffect({ skillName: skill.name })
        // Canvas动画会在完成后自动隐藏，不需要手动设置超时
      }
    }

    switch (skillId) {
      case 'feisha': // 飞沙走石：移除对手棋子
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            // 根据isPlayer判断移除谁的棋子
            if (isPlayer && newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = EMPTY
            } else if (!isPlayer && newBoard[targetRow][targetCol] === playerColor) {
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
        // 同时交换玩家和AI的颜色
        const newPlayerColor = playerColor === BLACK ? WHITE : BLACK
        setPlayerColor(newPlayerColor)
        setAiColor(prev => prev === BLACK ? WHITE : BLACK)
        // 使用flushSync或者简单的setState来更新currentPlayer
        setCurrentPlayer(newPlayerColor)
        break

      case 'wuzhong': // 无中生有：在任意位置放置己方棋子
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            if (newBoard[targetRow][targetCol] === EMPTY) {
              // 根据isPlayer判断放置谁的棋子
              newBoard[targetRow][targetCol] = isPlayer ? playerColor : aiColor
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
            // 根据isPlayer判断移动谁的棋子
            const targetColor = isPlayer ? aiColor : playerColor
            if (newBoard[targetRow][targetCol] === targetColor && newBoard[targetRow2][targetCol2] === EMPTY) {
              newBoard[targetRow2][targetCol2] = targetColor
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
            // 根据isPlayer判断移除谁的棋子
            if (isPlayer && newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = EMPTY
            } else if (!isPlayer && newBoard[targetRow][targetCol] === playerColor) {
              newBoard[targetRow][targetCol] = EMPTY
            }
            return newBoard
          })
        }
        break

      case 'liba': // 力拔山兮：清除对手所有棋子
        setBoard(prevBoard => {
          const newBoard = prevBoard.map(r => [...r])
          // 根据isPlayer判断清除谁的棋子
          const targetColor = isPlayer ? aiColor : playerColor
          for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
              if (newBoard[row][col] === targetColor) {
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
          // 根据isPlayer判断谁不能出棋
          aiSkipTurn: isPlayer,
          playerSkipTurn: !isPlayer
        }))
        break

      case 'shumu': // 鼠目寸光：标记（视觉效果，不影响逻辑）
        break

      case 'wanjian': // 万箭齐发：本回合可下三子
        // 只有玩家使用才生效（AI使用时不设置tripleMove，因为AI是自动下棋的）
        if (isPlayer) {
          setActiveSkillEffects(prev => ({
            ...prev,
            tripleMove: true,
            remainingMoves: 3
          }))
        } else {
          // AI使用万箭齐发：AI连续下三个棋子（不设置tripleMove，直接在aiUseSkill中处理）
          // 这里不需要做任何事，AI会在aiUseSkill中处理连续下棋
        }
        break

      case 'muxuan': // 目眩神迷：标记（视觉效果）
        break

      case 'yihua': // 移花接木：将对手棋子变为己方
        if (targetRow !== null && targetCol !== null) {
          setBoard(prevBoard => {
            const newBoard = prevBoard.map(r => [...r])
            // 根据isPlayer判断转换方向
            if (isPlayer && newBoard[targetRow][targetCol] === aiColor) {
              newBoard[targetRow][targetCol] = playerColor
            } else if (!isPlayer && newBoard[targetRow][targetCol] === playerColor) {
              newBoard[targetRow][targetCol] = aiColor
            }
            return newBoard
          })
        }
        break

      default:
        break
    }

    setSelectedSkill(null)
  }, [playerColor, aiColor, skills, selectedSkill])

  // AI使用技能
  const aiUseSkill = useCallback(() => {
    if (!skillMode || gameOver || usedSkills.length >= 12) return false

    // AI有60%的概率使用技能
    if (Math.random() > 0.6) return false

    // 获取可用的技能（排除已使用的，除非是"为所欲为"）
    const availableSkills = skills.filter(skill => !usedSkills.includes(skill.id) || skill.id === 'weiyu')
    if (availableSkills.length === 0) return false

    // 随机选择一个技能
    const selectedSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
    const selectedSkillId = selectedSkill.id

    // 找到中心位置或最后一个棋子位置用于特效显示
    let effectPosition = { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) }
    const aiPieces = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === aiColor) {
          aiPieces.push({ row, col })
        }
      }
    }
    if (aiPieces.length > 0) {
      effectPosition = aiPieces[aiPieces.length - 1] // 使用最后一个AI棋子位置
    }

    // 显示技能特效
    setAiSkillEffect({ skillName: selectedSkill.name, position: effectPosition })
    setTimeout(() => setAiSkillEffect(null), 2000) // 2秒后隐藏

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
          // 立即执行技能，不延迟
          executeSkill(selectedSkillId, target.row, target.col, null, null, false)
          return true
        }
        break

      case 'liangji': // 两极反转：直接执行
        executeSkill(selectedSkillId, null, null, null, null, false)
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
          executeSkill(selectedSkillId, target.row, target.col, null, null, false)
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
          executeSkill(selectedSkillId, target.row, target.col, null, null, false)
          return true
        }
        break

      case 'liba': // 力拔山兮：直接执行
        executeSkill(selectedSkillId, null, null, null, null, false)
        return true

      case 'lebu': // 乐不思蜀：直接执行
        executeSkill(selectedSkillId, null, null, null, null, false)
        return true

      case 'wanjian': // 万箭齐发：AI连续下三个棋子
        executeSkill(selectedSkillId, null, null, null, null, false)
        setAiUsingWanjian(true) // 标记AI正在使用万箭齐发
        
        // AI使用万箭齐发后，需要连续下三个棋子
        // 使用递归函数让AI连续下三个棋子
        const makeAiTripleMoves = (moveCount = 0) => {
          if (moveCount >= 3) {
            // 三子下完，切换到玩家回合
            setAiUsingWanjian(false)
            setCurrentPlayer(playerColor)
            setIsPlayerTurn(true)
            return
          }
          
          // 延迟一下再下棋，让特效显示
          setTimeout(() => {
            // 使用函数式更新来获取最新的board状态
            setBoard(prevBoard => {
              // 检查游戏是否已结束
              if (gameOver) {
                setAiUsingWanjian(false)
                return prevBoard
              }
              
              const moves = []
              
              // 收集所有可能的下棋位置
              for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                  if (prevBoard[row][col] === EMPTY) {
                    const attackScore = evaluatePosition(prevBoard, row, col, aiColor)
                    const defenseScore = evaluatePosition(prevBoard, row, col, playerColor)
                    const totalScore = attackScore * 2 + defenseScore
                    moves.push({ row, col, score: totalScore })
                  }
                }
              }
              
              if (moves.length > 0) {
                moves.sort((a, b) => b.score - a.score)
                const topScore = moves[0].score
                const topMoves = moves.filter(m => m.score === topScore)
                const bestMove = topMoves[Math.floor(Math.random() * topMoves.length)]
                
                const newBoard = prevBoard.map(r => [...r])
                newBoard[bestMove.row][bestMove.col] = aiColor
                setLastMove({ row: bestMove.row, col: bestMove.col })
                
                // 检查AI是否获胜
                const winLine = checkWin(newBoard, bestMove.row, bestMove.col, aiColor)
                
                setMoveHistory(prev => {
                  const newHistory = [...prev, {
                    row: bestMove.row,
                    col: bestMove.col,
                    player: 'AI',
                    color: aiColor,
                    moveNumber: prev.length + 1
                  }]
                  
                  
                  if (winLine) {
                    // AI获胜，保存记录但不显示弹窗
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
                    setAiUsingWanjian(false)
                    // AI胜利时不显示弹窗
                    return newHistory
                  }
                  
                  // 如果没有获胜，继续下下一个棋子
                  if (moveCount + 1 < 3) {
                    setTimeout(() => makeAiTripleMoves(moveCount + 1), 800)
                  } else {
                    // 三子下完，切换到玩家回合
                    setAiUsingWanjian(false)
                    setCurrentPlayer(playerColor)
                    setIsPlayerTurn(true)
                  }
                  
                  return newHistory
                })
                
                return newBoard
              } else {
                // 没有可下的位置，切换到玩家回合
                setAiUsingWanjian(false)
                setCurrentPlayer(playerColor)
                setIsPlayerTurn(true)
                return prevBoard
              }
            })
          }, 800) // 每次下棋间隔800ms
        }
        
        // 开始连续下棋
        makeAiTripleMoves()
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
          executeSkill(selectedSkillId, target.row, target.col, null, null, false)
          return true
        }
        break

      default:
        break
    }
    return false
  }, [skillMode, gameOver, usedSkills, board, playerColor, aiColor, executeSkill, evaluatePosition, skills, checkWin, setAiUsingWanjian])

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

    // 如果技能模式开启，AI可能先使用技能（60%概率）
    if (skillMode && Math.random() < 0.6) {
      const skillUsed = aiUseSkill()
      if (skillUsed) {
        // 如果AI使用了"万箭齐发"，aiUseSkill内部已经处理了下棋逻辑，不需要再调用makeAiMove
        // 其他技能使用后，延迟2000ms再下棋（等待技能特效显示完成）
        if (!aiUsingWanjian) {
          setTimeout(() => {
            makeAiMove()
          }, 2000)
        }
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
            // AI胜利时不显示弹窗
          } else {
            setCurrentPlayer(playerColor)
            setIsPlayerTurn(true)
          }
          
          return newHistory
        })

        return newBoard
      })
    }
  }, [aiColor, playerColor, gameOver, checkWin, evaluatePosition, activeSkillEffects, skillMode, aiUseSkill, aiUsingWanjian])


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
          setShowVictoryModal(true)
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
    // 如果游戏结束，不允许打开技能面板
    if (gameOver) return
    // 直接打开技能面板，不切换skillMode状态
    setShowSkillPanel(true)
  }, [gameOver])

  // 选择技能
  const handleSelectSkill = useCallback((skillId, currentSelectedSkill = null) => {
    // 如果游戏结束，不允许选择技能
    if (gameOver) return
    
    // 使用传入的currentSelectedSkill或state中的selectedSkill
    const currentSkill = currentSelectedSkill !== null ? currentSelectedSkill : selectedSkill
    
    // 如果当前选中的是"为所欲为"，且选择了其他技能，则执行该技能
    if (currentSkill === 'weiyu' && skillId !== 'weiyu') {
      // 使用"为所欲为"选择的技能，不标记为已使用
      setSelectedSkill(skillId)
      setShowSkillPanel(false)
      // 继续执行技能逻辑
    } else if (skillId === 'weiyu') {
      // 为所欲为：重新打开技能面板，允许选择任何技能（包括已使用的）
      setSelectedSkill('weiyu')
      setShowSkillPanel(true)
      return
    } else {
      // 正常选择技能
      setSelectedSkill(skillId)
      setShowSkillPanel(false)
    }

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
      // 为所欲为的逻辑在handleSelectSkill中处理，这里不需要
      // case 'weiyu': // 为所欲为：重新打开技能面板
      //   setShowSkillPanel(true)
      //   setSelectedSkill(null)
      //   break
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
    setShowVictoryModal(false) // 关闭胜利弹窗
    setAiSkillEffect(null) // 清除AI技能特效
    setPlayerSkillEffect(null) // 清除玩家技能特效
    setAiUsingWanjian(false) // 清除AI万箭齐发标记
    
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

  // 发送消息
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !selectedBot || isSendingMessage) return

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    const messageToSend = inputMessage
    setInputMessage('')
    setIsSendingMessage(true)

    setChatMessages(prev => {
      const newMessages = [...prev, userMessage]
      
      // 如果使用默认AI，使用本地模拟回复
      if (useDefaultAI) {
        // 获取最近的AI回复（用于避免重复）
        const recentBotReplies = prev
          .filter(msg => msg.type === 'bot')
          .map(msg => msg.content)
          .slice(-3)
        
        // 模拟网络延迟
        setTimeout(() => {
          const reply = getDefaultAIReply(
            messageToSend, 
            recentBotReplies, 
            chatBoard, 
            chatPlayerColor, 
            chatAIColor, 
            chatGameOver,
            setChatBoard,
            setChatGameOver,
            setChatWinner,
            setChatMoveHistory
          )
          const botMessage = {
            type: 'bot',
            content: reply,
            timestamp: new Date()
          }
          setChatMessages(prevMsgs => [...prevMsgs, botMessage])
          setIsSendingMessage(false)
        }, 500 + Math.random() * 500) // 500-1000ms延迟，模拟真实AI响应
      }
      
      return newMessages
    })
  }, [inputMessage, selectedBot, isSendingMessage, useDefaultAI, chatBoard, chatPlayerColor, chatAIColor, chatGameOver])

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

      {/* 右上角AI头像和对话气泡 */}
      {selectedBot && (() => {
        // 获取最新的AI回复
        const latestBotMessage = [...chatMessages].reverse().find(msg => msg.type === 'bot')
        const hasMessage = latestBotMessage && !isSendingMessage
        
        return (
          <div className="ai-chat-top-right">
            <div className="ai-avatar-with-wreath">
              <img 
                src={selectedBot.avatar || '/default-avatar.png'} 
                alt={selectedBot.name}
                className="ai-avatar-circle"
                onError={(e) => {
                  e.target.src = '/default-avatar.png'
                }}
              />
            </div>
            {(hasMessage || isSendingMessage) && (
              <div className="ai-speech-bubble">
                <div className="speech-bubble-content">
                  {isSendingMessage ? (
                    <div className="typing-indicator">正在输入...</div>
                  ) : (
                    <div className="speech-bubble-text">{latestBotMessage.content}</div>
                  )}
                </div>
                <div className="speech-bubble-decoration">
                  <span className="berry">🍒</span>
                  <span className="holly">🍃</span>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      <div className="gomoku-container">

        <div className="game-info">
          {gameOver ? (
            <div className="winner-message q-font-text">
              <h2>
                {winner === playerColor ? '🎉 你获胜了！' : '😔 AI获胜！'}
              </h2>
            </div>
          ) : (
            <div className="current-player">
              {selectedBot && (
                <div className="ai-turn-message">
                  {isPlayerTurn ? '该你了' : '我想想'}
                </div>
              )}
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
            {/* 玩家技能特效 - Canvas逐帧动画 */}
            {playerSkillEffect && (
              <div className="player-skill-effect-overlay">
                <SkillCanvasAnimation 
                  skillName={playerSkillEffect.skillName}
                  onComplete={() => {
                    // 动画完成后延迟隐藏
                    setTimeout(() => {
                      setPlayerSkillEffect(null)
                    }, 1000)
                  }}
                />
              </div>
            )}
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
                    {/* AI技能特效 */}
                    {aiSkillEffect && aiSkillEffect.position.row === rowIndex && aiSkillEffect.position.col === colIndex && (
                      <div className="ai-skill-effect">
                        <div className="skill-vortex"></div>
                        <div className="skill-particles"></div>
                        <div className="skill-text">ta使用了{aiSkillEffect.skillName}</div>
                      </div>
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
              <h3>技能库</h3>
              <button className="close-skill q-font-button" onClick={() => setShowSkillPanel(false)}>✕</button>
            </div>
            <div className="skill-list">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  className={`skill-button ${usedSkills.includes(skill.id) && selectedSkill !== 'weiyu' ? 'used' : ''} ${selectedSkill === 'weiyu' ? 'weiyu-selected' : ''}`}
                  onClick={() => handleSelectSkill(skill.id, selectedSkill)}
                  disabled={gameOver || (usedSkills.includes(skill.id) && selectedSkill !== 'weiyu')}
                >
                  <div className="skill-name">{skill.name}</div>
                  <div className="skill-desc">{skill.desc}</div>
                </button>
              ))}
            </div>
            <div className="skill-panel-footer">
              <button className="skill-return-button" onClick={() => setShowSkillPanel(false)}>
                返回棋盘
              </button>
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
            }}>✕</button>
          </div>
        )}

        {/* 胜利弹窗 */}
        {showVictoryModal && (
          <div className="victory-modal-overlay">
            <div className="victory-modal">
              <div className="victory-modal-header">
                <div className="victory-stars">
                  <div className="victory-star">★</div>
                  <div className="victory-star">★</div>
                  <div className="victory-star victory-star-large">★</div>
                  <div className="victory-star">★</div>
                  <div className="victory-star">★</div>
                </div>
                <button className="victory-close" onClick={() => setShowVictoryModal(false)}>✕</button>
              </div>
              <div className="victory-modal-content">
                <h2 className="victory-title">恭喜胜利!</h2>
                <p className="victory-subtitle">你成功击败了AI！</p>
              </div>
              <div className="victory-modal-buttons">
                <button className="victory-button" onClick={handleReset}>
                  再来一局
                </button>
                <button className="victory-button" onClick={() => {
                  setShowVictoryModal(false)
                  setShowHistory(true)
                }}>
                  查看历史
                </button>
              </div>
            </div>
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
                <div className="history-list-header">
                  <span className="history-list-checkbox">☐</span>
                  <span className="history-list-date">日期</span>
                  <span className="history-list-winner">胜出局</span>
                </div>
                <div className="history-list">
                  {gameHistory.map((record) => (
                    <div key={record.id} className="history-item q-font-text">
                      <span className="history-item-radio">○</span>
                      <span className="history-date">{record.date}</span>
                      <span className={`history-winner ${record.winner === '玩家' ? 'player-win' : 'ai-win'}`}>
                        {record.winner === '玩家' ? '胜利' : '失败'}
                      </span>
                    </div>
                  ))}
                </div>
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
          {/* 聊天输入区域 - 移到按钮上方 */}
          {selectedBot && (
            <div className="chat-input-area-bottom">
              <input
                type="text"
                placeholder="输入消息..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="chat-input-bottom"
                disabled={isSendingMessage}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isSendingMessage || !inputMessage.trim()} 
                className="chat-send-btn-bottom"
              >
                发送
              </button>
            </div>
          )}
          
          <div className="footer-buttons">
            <button className="start-button" onClick={handleReset}>
              开始
            </button>
            <button 
              className={`start-button ${skillMode ? 'active' : ''}`} 
              onClick={toggleSkillMode}
              disabled={gameOver}
            >
              技能
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
