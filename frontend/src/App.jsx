import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from './redux/userSlice.js'

import Home from './pages/Home.jsx'
import AuthModal from './components/AuthModal.jsx'
import InterviewPage from './pages/InterviewPage.jsx'
import GlobalRouteListener from './components/GlobalRouteListener.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Step3Report from './components/Step3Report.jsx'
import { BsRobot } from 'react-icons/bs'
import Pricing from './components/Pricing.jsx'

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const ProtectedRoute = ({ user, isCheckingAuth, children }) => {
  if (isCheckingAuth) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
        <div className='animate-bounce mb-4 bg-linear-to-r from-blue-400 to-blue-700 text-white rounded-lg p-2'>
          <BsRobot className="text-white-600 text-5xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Interviewer.ai
        </h2>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading Interviewer.ai...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

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

  return (
    <>
      <GlobalRouteListener/>
      <AuthModal />
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element ={
          <ProtectedRoute user={user} isCheckingAuth={isCheckingAuth}>
            <Dashboard/>
          </ProtectedRoute>
        }/>
        <Route path='/interview' element={
          <ProtectedRoute user={user} isCheckingAuth={isCheckingAuth}>
            <InterviewPage />
          </ProtectedRoute>
        } />
        <Route path='/report/:id' element={
          <ProtectedRoute user={user} isCheckingAuth={isCheckingAuth}>
            <Step3Report />
          </ProtectedRoute>
        } />      
        <Route path='/pricing' element={<Pricing />} />
      </Routes>
    </>
  )
}

export default App