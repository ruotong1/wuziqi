import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story7 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '大姐大的秘密',
      content: '萨拉（Sarah）是珊瑚学院的大姐大，所有人都怕她。但没有人知道，她内心深处有一个秘密——她爱上了病娇男马克（Mark）。',
      scene: '👑'
    },
    {
      title: '暗恋的开始',
      content: '从第一次见到马克，萨拉就被他那种危险而迷人的气质吸引。她喜欢他的偏执，喜欢他的占有欲，甚至喜欢他的病态。',
      scene: '💕'
    },
    {
      title: '痛苦的发现',
      content: '但马克却爱上了被萨拉霸凌的莉莉。当萨拉看到马克保护莉莉时，她的心碎了。她霸凌莉莉，某种程度上是因为嫉妒。',
      scene: '💔'
    },
    {
      title: '扭曲的竞争',
      content: '萨拉决定用更极端的方式引起马克的注意。她变本加厉地欺负莉莉，希望马克能注意到她，哪怕是恨她也好。',
      scene: '😈'
    },
    {
      title: '毕业典礼的真相',
      content: '在毕业典礼上，当马克再次保护莉莉时，萨拉终于忍不住了。她冲上台，当着所有人的面说："马克，我喜欢你！为什么你只看到她？"',
      scene: '🎭'
    },
    {
      title: '马克的回应',
      content: '马克冷冷地看着萨拉："因为你伤害了她。而我会保护她，直到永远。" 萨拉的心彻底碎了，但她也明白了——有些爱，注定得不到。',
      scene: '❄️'
    },
    {
      title: '最后的告别',
      content: '毕业典礼结束后，萨拉独自一人离开了学校。她回头看了一眼马克和莉莉，心中五味杂陈。也许，这就是她的结局。',
      scene: '🌅'
    },
    {
      title: '新的开始',
      content: '但也许，这也是新的开始。萨拉决定改变自己，也许有一天，她会遇到真正属于她的人...',
      scene: '✨'
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
    <div className="story-page story-7">
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

export default Story7




















