import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story5 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '躲藏的追逐',
      content: '在珊瑚学院的走廊里，清纯的艾米（Amy）正在快速游动，她的心跳加速。身后传来病娇男凯文（Kevin）的声音："艾米，别跑！我只想和你说话..."',
      scene: '🏃'
    },
    {
      title: '第一次相遇',
      content: '一切开始于图书馆。艾米正在安静地看书，凯文突然出现，他的眼神中有着某种危险的执着。"我终于找到你了，"他说，"你是我的。"',
      scene: '👀'
    },
    {
      title: '追逐开始',
      content: '从那天起，凯文开始跟踪艾米。无论她走到哪里，他都会出现。艾米感到恐惧，开始躲避他，但凯文总能找到她。',
      scene: '🔍'
    },
    {
      title: '躲藏游戏',
      content: '毕业典礼这天，艾米决定彻底躲起来。她藏在废弃的教室、图书馆的角落、甚至学校的储物间。但凯文像影子一样紧追不舍。',
      scene: '🚪'
    },
    {
      title: '被发现',
      content: '在学校的后花园，艾米以为安全了。但凯文突然出现，他的脸上带着病态的笑容。"你逃不掉的，艾米。我们注定要在一起。"',
      scene: '😈'
    },
    {
      title: '对峙',
      content: '艾米鼓起勇气："我不喜欢你这样！请离我远点！" 凯文的表情变得痛苦："为什么？我只是...我只是太爱你了..."',
      scene: '💔'
    },
    {
      title: '意外的转折',
      content: '在毕业典礼的舞台上，当所有人都在庆祝时，凯文突然冲上台，单膝跪地。"艾米，我知道我错了。但请给我一个机会，让我用正确的方式爱你。"',
      scene: '🎭'
    },
    {
      title: '新的开始？',
      content: '艾米看着这个曾经让她恐惧的人，现在却看到了他眼中的真诚和痛苦。也许，一切还有转机...',
      scene: '💫'
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
    <div className="story-page story-5">
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

export default Story5
























