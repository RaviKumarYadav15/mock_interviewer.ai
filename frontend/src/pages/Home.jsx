import Navbar from '../components/Navbar.jsx'
import Process from '../components/Process.jsx'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'motion/react'
import { setAuthModalOpen } from '../redux/userSlice.js'
import { useNavigate } from 'react-router-dom'
import { BsRobot, BsClock } from "react-icons/bs"
import { HiSparkles } from 'react-icons/hi'
import AiCapabilities from '../components/AiCapabilities.jsx'
import Footer from '../components/Footer.jsx'

const Home = () => {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleStart = () => {
    if (!userData) {
      dispatch(setAuthModalOpen(true))
    } else {
      navigate('/interview')
    }
  }

  const handleHistory = () => {
    if (!userData) {
      dispatch(setAuthModalOpen(true))
    } else {
      navigate('/history')
    }
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col overflow-x-hidden'>
      <Navbar />

      <div className='flex-1 px-6 pt-20'>
        <div className='flex justify-center mb-8'>
          <div className='bg-blue-100 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
            <HiSparkles size={20} className='text-blue-600' />
            <span className='font-medium text-gray-700'>AI Powered Smart Interview Platform</span>
          </div>
        </div>

        <div className='text-center mb-20'>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-4xl md:text-6xl font-semibold max-w-4xl mx-auto leading-tight md:leading-snug'
          >
            Practice Interviews with
            <span className='relative inline-block ml-3 mt-2 md:mt-0'>
              <span className='bg-blue-100 text-blue-600 rounded-full px-4 py-1'>
                AI Intelligence
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'
          >
            Role-based mock interviews with smart follow-ups, adaptive difficulty, and real-time performance evaluation.
          </motion.p>

          <div className='flex flex-wrap justify-center gap-4 mt-10'>
            <motion.button
              whileHover={{opacity:0.9, scale:1.03}}
              whileTap={{opacity:1, scale:0.98}}
              onClick={handleStart}
              className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-md hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
            >
              <BsRobot size={20} />
              Start Interview
            </motion.button>
            
            <motion.button
              whileHover={{opacity:0.9, scale:1.03}}
              whileTap={{opacity:1, scale:0.98}}
              onClick={handleHistory}
              className="bg-white border border-blue-200 text-blue-600 px-10 py-3 rounded-full hover:bg-blue-50 transition flex items-center gap-2 cursor-pointer"
            >
              <BsClock size={18} />
              View History
            </motion.button>
          </div>
        </div>

        <Process />
        <AiCapabilities />
      </div>
      
      <Footer/>
    </div>
  )
}

export default Home