// 游戏状态管理
const STORAGE_KEY = 'mermaid-song-game-state'

const defaultState = {
  unlockedStories: [1, 2, 3, 4], // 前4个故事默认解锁
  unlockedCharacters: [],
  completedLevels: [],
  currentLevel: 1,
  characters: {} // 人物饲养数据 { characterId: { level, exp, lastFed, etc } }
}

export const getGameState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load game state:', e)
  }
  return defaultState
}

export const saveGameState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save game state:', e)
  }
}

export const unlockStory = (storyId) => {
  const state = getGameState()
  if (!state.unlockedStories.includes(storyId)) {
    state.unlockedStories.push(storyId)
    saveGameState(state)
  }
}

export const unlockCharacter = (characterId) => {
  const state = getGameState()
  if (!state.unlockedCharacters.includes(characterId)) {
    state.unlockedCharacters.push(characterId)
    // 初始化人物数据
    if (!state.characters[characterId]) {
      state.characters[characterId] = {
        level: 1,
        exp: 0,
        lastFed: null,
        feedCount: 0,
        mood: 'happy'
      }
    }
    saveGameState(state)
  }
}

export const feedCharacter = (characterId) => {
  const state = getGameState()
  if (state.characters[characterId]) {
    const character = state.characters[characterId]
    const now = Date.now()
    
    // 检查是否可以喂食（至少间隔1小时）
    if (character.lastFed && (now - character.lastFed) < 3600000) {
      return { success: false, message: '喂食间隔太短，请稍后再试' }
    }
    
    character.feedCount += 1
    character.exp += 10
    character.lastFed = now
    
    // 升级逻辑（每100经验升一级）
    const newLevel = Math.floor(character.exp / 100) + 1
    if (newLevel > character.level) {
      character.level = newLevel
    }
    
    // 根据喂食次数更新心情
    if (character.feedCount < 5) {
      character.mood = 'happy'
    } else if (character.feedCount < 10) {
      character.mood = 'excited'
    } else {
      character.mood = 'loved'
    }
    
    saveGameState(state)
    return { success: true, character }
  }
  return { success: false, message: '人物未解锁' }
}

export const getCharacter = (characterId) => {
  const state = getGameState()
  return state.characters[characterId] || null
}

export const completeLevel = (levelId) => {
  const state = getGameState()
  if (!state.completedLevels.includes(levelId)) {
    state.completedLevels.push(levelId)
    saveGameState(state)
  }
}

export const isStoryUnlocked = (storyId) => {
  const state = getGameState()
  return state.unlockedStories.includes(storyId)
}

export const isCharacterUnlocked = (characterId) => {
  const state = getGameState()
  return state.unlockedCharacters.includes(characterId)
}

export const isLevelCompleted = (levelId) => {
  const state = getGameState()
  return state.completedLevels.includes(levelId)
}
