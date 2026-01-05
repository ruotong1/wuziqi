import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story2 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '潮汐下的秘密',
      content: '毕业舞会的夜晚，珊瑚学院的大厅被五彩的珊瑚灯照亮。音乐如潮水般涌动，所有人鱼都在尽情舞蹈。',
      scene: '💃'
    },
    {
      title: '神秘的舞伴',
      content: '米拉（Mira）注意到一个从未见过的身影。他来自遥远的北极海域，有着独特的银色鱼尾，在灯光下闪闪发光。',
      scene: '✨'
    },
    {
      title: '共舞',
      content: '当他邀请米拉共舞时，她发现他的眼中有着和她一样的孤独。他们随着音乐旋转，仿佛整个世界只剩下彼此。',
      scene: '🌊'
    },
    {
      title: '秘密的交换',
      content: '"我叫艾登（Aiden），"他在她耳边轻声说，"我其实不是来参加毕业典礼的，我是来找你的。"',
      scene: '🔮'
    },
    {
      title: '真相',
      content: '原来，艾登一直在寻找那个在海洋论坛上和他讨论潮汐理论的神秘人鱼。通过她的文字，他认出了她。',
      scene: '💌'
    },
    {
      title: '跨越海域',
      content: '他们发现彼此来自完全不同的海域，却有着相同的梦想和理念。距离不再是问题，因为他们找到了彼此。',
      scene: '🌍'
    },
    {
      title: '新的开始',
      content: '舞会结束时，艾登拿出一个古老的传音贝壳。"无论我们相隔多远，"他说，"我们都能听到彼此的声音。"',
      scene: '🐚'
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
    <div className="story-page story-2">
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

export default Story2




















