import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../../components/OceanBackground'
import './Story.css'

const Story4 = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(0)

  const pages = [
    {
      title: '深海的回音',
      content: '在珊瑚学院，有一个古老的传说：如果你对着传音贝壳说出真心话，它会把你的声音传送到命中注定的那个人那里。',
      scene: '🐚'
    },
    {
      title: '孤独的声音',
      content: '索菲亚（Sophia）是一个内向的人鱼，她总是独自一人。毕业前夕，她决定尝试那个传说，对着贝壳说出了自己的心声。',
      scene: '💭'
    },
    {
      title: '意外的回应',
      content: '几天后，索菲亚收到了一个来自未知海域的传音贝壳。里面传来一个温柔的声音："我听到了你的声音，我叫诺亚（Noah）。"',
      scene: '📻'
    },
    {
      title: '跨越距离',
      content: '通过传音贝壳，他们开始交流。诺亚来自最深的马里亚纳海沟，而索菲亚在浅海。但他们发现彼此有着惊人的相似。',
      scene: '🌊'
    },
    {
      title: '毕业的约定',
      content: '他们约定在毕业典礼这天见面。索菲亚紧张又期待，她不知道诺亚长什么样子，但她知道，他们一定能认出彼此。',
      scene: '💫'
    },
    {
      title: '相遇',
      content: '毕业典礼上，当索菲亚看到一个拿着传音贝壳的人鱼时，她的心跳加速了。他转过身，眼中有着和她一样的期待。',
      scene: '👀'
    },
    {
      title: '确认',
      content: '"是你吗？"他们同时问出这句话，然后都笑了。即使从未见过面，他们也能感受到彼此就是那个对的人。',
      scene: '💕'
    },
    {
      title: '新的旅程',
      content: '他们决定一起探索海洋的每一个角落，用传音贝壳记录下他们的故事，让更多孤独的人鱼找到属于自己的声音。',
      scene: '🌍'
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
    <div className="story-page story-4">
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

export default Story4




















