import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story3 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '海星与贝壳',
      content: '从小一起在珊瑚礁长大的露娜（Luna）和里奥（Leo），是所有人眼中的青梅竹马。他们一起上学，一起玩耍，一起成长。',
      scene: '🌟'
    },
    {
      title: '最好的朋友',
      content: '在所有人看来，他们只是最好的朋友。但只有他们自己知道，内心深处有着不一样的情感，却从未说出口。',
      scene: '🤝'
    },
    {
      title: '毕业的焦虑',
      content: '毕业意味着分离。露娜要去东海的海洋研究院，而里奥要去西海的探险队。他们都知道，这可能是最后的机会。',
      scene: '😰'
    },
    {
      title: '毕业典礼',
      content: '在毕业典礼上，当所有人都在庆祝时，露娜和里奥却感到前所未有的紧张。他们知道，有些话必须说出来。',
      scene: '🎓'
    },
    {
      title: '海星的故事',
      content: '里奥走向露娜，手中拿着一个精美的海星。"你还记得吗？"他说，"小时候你说过，海星代表永恒的爱。"',
      scene: '⭐'
    },
    {
      title: '贝壳的回应',
      content: '露娜从口袋里拿出一个贝壳，里面装着一颗珍珠。"这是我为你收集的，"她说，"每一颗都代表我想对你说的话。"',
      scene: '🐚'
    },
    {
      title: '终于',
      content: '"我喜欢你，从很久以前就开始了。"他们同时说出这句话，然后相视而笑。原来，他们一直在等待同一个时刻。',
      scene: '💕'
    },
    {
      title: '新的约定',
      content: '他们约定，无论相隔多远，都要在每个月圆之夜，通过传音贝壳分享彼此的生活。距离不会改变他们的心。',
      scene: '🌙'
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
    <div className="story-page story-3">
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

export default Story3




















