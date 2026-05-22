import React, { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './redux/userSlice.js'

import Home from './pages/Home.jsx'
import AuthModal from './components/AuthModal.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import GlobalRouteListener from './components/GlobalRouteListener.jsx'
import Navbar from './components/Navbar.jsx'

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userData);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const getUser = async () => {
    try {
      const result = await axios.get(
        serverUrl + "/api/user/current-user",
        { withCredentials: true }
      )
      dispatch(setUserData(result.data))
    } catch (error) {
      console.log(error)
      dispatch(setUserData(null))
    } finally {
      setIsCheckingAuth(false)
    }
  }

  useEffect(() => {
    getUser()
  }, [dispatch])

  if (isCheckingAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <p className="text-gray-500 font-semibold animate-pulse">
          Loading Interviewer.ai...
        </p>
      </div>
    )
  }

  return (
    <>
      <GlobalRouteListener/>
      <AuthModal />
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/interview' element={user ? <InterviewPage /> : <Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
