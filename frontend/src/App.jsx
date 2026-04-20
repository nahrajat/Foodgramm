import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Aboutus from './pages/Aboutus.jsx'
import Help from './pages/Help.jsx'
import Connect from './pages/Connect.jsx'
import UserRegister from './pages/UserRegister.jsx'
import UserLogin from './pages/UserLogin.jsx'
import FoodPartnerRegister from './pages/FoodPartnerRegister.jsx'
import FoodPartnerLogin from './pages/FoodPartnerLogin.jsx'
import ChooseRegister from './pages/ChooseRegister.jsx'
import Homepage from './pages/general/Homepage.jsx'
import CreateFood from './pages/food-partner/Createfood.jsx'
import Profile from './pages/food-partner/Profile.jsx'
import Saved from './pages/general/Saved.jsx'
import UserProfile from './pages/general/UserProfile.jsx'
import BottomNav from './components/BottomNav.jsx'
import TopProfileMenu from './components/TopProfileMenu.jsx'




const App = () => {
  return (
    <div>
      <TopProfileMenu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/help" element={<Help />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/register" element={<ChooseRegister />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/food-partner/register" element={<FoodPartnerRegister />} />
        <Route path="/food-partner/login" element={<FoodPartnerLogin />} />
        <Route path="/choose-register" element={<ChooseRegister />} />
        <Route path="/saved" element={<><Saved /><BottomNav /></>} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/create-food" element={<CreateFood />} />
        <Route path="/food-partner/:id" element={<Profile />} />

      </Routes>
    </div>
  )
}

export default App
