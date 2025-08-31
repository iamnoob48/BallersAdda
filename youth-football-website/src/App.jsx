import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage.jsx'
import TournamentsList from './pages/TournamentList.jsx';
import AcademyList from "./pages/AcademyList.jsx"
import SignUp from './pages/SignUp';
import PlayerLogin from './pages/PlayerLogin';
import LoginPage from './pages/LoginPage';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage/>}></Route>
          <Route path="/tournaments" element={<TournamentsList/>}></Route>
          <Route path="/academy" element={<AcademyList/>}></Route>
          <Route path="/Login" element={<SignUp/>}/>
          <Route path="/playerLogin" element={<PlayerLogin/>}/>
          <Route path="/Login/LoginPage" element={<LoginPage/>}/>

        </Routes>
      </Router>
      
    </>
  )
}

export default App
