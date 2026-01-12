import React from 'react'
import { useNavigate } from 'react-router-dom'
import OceanBackground from '../components/OceanBackground'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <OceanBackground />
      <div className="home-content">
        <div className="title-container">
          <h1 className="main-title">
            <span className="title-line">人鱼之歌</span>
            <span className="subtitle">海洋学校的毕业典礼</span>
          </h1>
        </div>
        
        <div className="school-intro">
          <div className="school-building">
            <div className="building-top"></div>
            <div className="building-body">
              <div className="window"></div>
              <div className="window"></div>
              <div className="window"></div>
            </div>
          </div>
          <p className="intro-text">
            在深海的珊瑚学院，人鱼学生们度过了美好的学习时光。
            <br />
            今天，是毕业典礼的日子，也是许多奇妙爱情故事开始的日子...
          </p>
        </div>

        <button 
          className="enter-button"
          onClick={() => navigate('/graduation')}
        >
          <span className="button-text">进入毕业典礼</span>
          <span className="button-glow"></span>
        </button>

        <div className="floating-fish">
          <div className="fish fish-1">🐟</div>
          <div className="fish fish-2">🐠</div>
          <div className="fish fish-3">🐡</div>
        </div>
      </div>
    </div>
  )
}

export default Home
























