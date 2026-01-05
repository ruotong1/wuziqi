import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story6 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '霸凌的开始',
      content: '清纯的莉莉（Lily）是珊瑚学院的新生。她温柔善良，总是帮助别人。但她的善良却引来了校园大姐大萨拉（Sarah）的嫉妒和敌意。',
      scene: '😢'
    },
    {
      title: '痛苦的经历',
      content: '萨拉开始霸凌莉莉。她抢走莉莉的东西，在众人面前羞辱她，甚至威胁她的朋友远离她。莉莉每天以泪洗面，但没有人敢帮助她。',
      scene: '💔'
    },
    {
      title: '病娇男的关注',
      content: '病娇男马克（Mark）注意到了这一切。他看到了莉莉的痛苦，也看到了萨拉的残忍。但更重要的是，他看到了莉莉眼中的坚强。',
      scene: '👁️'
    },
    {
      title: '意外的保护',
      content: '当萨拉再次欺负莉莉时，马克突然出现。他挡在莉莉面前，眼神冰冷："如果你再碰她一下，我会让你后悔。" 萨拉被他的气势吓退了。',
      scene: '🛡️'
    },
    {
      title: '复杂的情感',
      content: '莉莉对马克既感激又害怕。她知道马克有某种危险的特质，但他确实保护了她。而马克，第一次感受到了除了占有欲之外的情感——保护欲。',
      scene: '💭'
    },
    {
      title: '毕业典礼',
      content: '在毕业典礼上，萨拉试图最后一次羞辱莉莉。但马克再次出现，他当着所有人的面说："莉莉，从今以后，没有人能伤害你。因为你是我的。"',
      scene: '🎓'
    },
    {
      title: '扭曲的爱',
      content: '莉莉知道马克的爱是扭曲的，是病态的。但在经历了那么多痛苦之后，这种强烈的保护让她感到...安全？她开始怀疑自己的感受。',
      scene: '🌀'
    },
    {
      title: '新的关系',
      content: '毕业典礼结束后，莉莉和马克一起离开了学校。他们的关系复杂而危险，但也许，这就是他们需要的彼此...',
      scene: '🌊'
    }
  ]

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="story-page story-6">
      <OceanBackground />
      <div className="story-content">
        <div className="story-header">
          <button className="back-to-graduation" onClick={() => navigate('/graduation')}>
            ← 返回毕业典礼
          </button>
          <div className="story-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="story-body">
          <div className="story-scene">{pages[currentPage].scene}</div>
          <h1 className="story-page-title">{pages[currentPage].title}</h1>
          <p className="story-text">{pages[currentPage].content}</p>
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
            {currentPage + 1} / {pages.length}
          </span>
          <button 
            className="nav-button next-button"
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
          >
            {currentPage === pages.length - 1 ? '完成 ✓' : '下一页 →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Story6




















