import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage.jsx'
import TournamentsList from './pages/TournamentList.jsx';
import AcademyList from "./pages/AcademyList.jsx"

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage/>}></Route>
          <Route path="/tournaments" element={<TournamentsList/>}></Route>
          <Route path="/academy" element={<AcademyList/>}></Route>
        </Routes>
      </Router>
      
    </>
  )
}

export default App
