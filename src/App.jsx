import React from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Graduation from './pages/Graduation'
import LevelSelect from './pages/LevelSelect'
import Story1 from './pages/stories/Story1'
import Story2 from './pages/stories/Story2'
import Story3 from './pages/stories/Story3'
import Story4 from './pages/stories/Story4'
import Story5 from './pages/stories/Story5'
import Story6 from './pages/stories/Story6'
import Story7 from './pages/stories/Story7'
import UserStory from './pages/stories/UserStory'
import Aquarium from './pages/Aquarium'
import Report from './pages/Report'
import StoryEditor from './pages/StoryEditor'
import Gomoku from './pages/Gomoku'
import './App.css'

function LevelSelectWrapper() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  return <LevelSelect storyId={parseInt(storyId)} onBack={() => navigate('/graduation')} />
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/graduation" element={<Graduation />} />
          <Route path="/level/:storyId" element={<LevelSelectWrapper />} />
          <Route path="/story/1" element={<Story1 />} />
          <Route path="/story/2" element={<Story2 />} />
          <Route path="/story/3" element={<Story3 />} />
          <Route path="/story/4" element={<Story4 />} />
          <Route path="/story/5" element={<Story5 />} />
          <Route path="/story/6" element={<Story6 />} />
          <Route path="/story/7" element={<Story7 />} />
          <Route path="/user-story/:storyId" element={<UserStory />} />
          <Route path="/story-editor" element={<StoryEditor />} />
          <Route path="/aquarium" element={<Aquarium />} />
          <Route path="/report" element={<Report />} />
          <Route path="/gomoku" element={<Gomoku />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
