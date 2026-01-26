import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story1 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '珊瑚与珍珠的约定',
      content: '在珊瑚学院的图书馆深处，有一个被遗忘的角落。那里存放着最古老的海洋诗集，散发着淡淡的珍珠光泽。',
      scene: '📚'
    },
    {
      title: '第一次相遇',
      content: '艾莉亚（Aria）正在寻找那本传说中的《深海之歌》，当她伸手去够那本放在最高层的书时，另一只手也同时伸了过来。',
      scene: '🤝'
    },
    {
      title: '意外的触碰',
      content: '他们的手在空中相遇，指尖轻触的瞬间，仿佛有电流穿过。艾莉亚抬头，看到了一双如深海般深邃的眼睛。',
      scene: '💫'
    },
    {
      title: '他的名字',
      content: '"我叫凯尔（Kyle），"他微笑着说，"你也在找这本书吗？" 艾莉亚点点头，心跳加速。',
      scene: '💙'
    },
    {
      title: '共同的爱好',
      content: '他们发现彼此都热爱古老的海洋诗歌，都梦想着成为海洋诗人。在那个安静的下午，他们一起读诗，一起分享梦想。',
      scene: '📖'
    },
    {
      title: '毕业典礼',
      content: '今天，在毕业典礼上，凯尔走向艾莉亚，手中拿着一本精美的诗集。"这是我为你写的，"他说，"每一首诗都是关于你的。"',
      scene: '🎓'
    },
    {
      title: '永恒的约定',
      content: '艾莉亚翻开诗集，第一页写着："在深海的图书馆里，我找到了我的珍珠。" 他们相视而笑，约定一起游向更广阔的海域。',
      scene: '💕'
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
    <div className="story-page story-1">
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

export default Story1

























