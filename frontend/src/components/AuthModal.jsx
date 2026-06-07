import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import { BsRobot } from 'react-icons/bs'
import { IoSparkles, IoClose } from 'react-icons/io5' 
import { FcGoogle } from "react-icons/fc"
import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../utils/firebase.js"
import axios from "axios"
import { serverUrl } from '../App.jsx'
import { setUserData, setAuthModalOpen } from '../redux/userSlice.js'

const AuthModal = () => {
    const dispatch = useDispatch()
    const isOpen = useSelector((state) => state.user.isAuthModalOpen)
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleAuth = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            const response = await signInWithPopup(auth, provider)
            let user = response.user
            let name = user.displayName
            let email = user.email
            const result = await axios.post(serverUrl + "/api/auth/google", {name, email}, {withCredentials: true})
            dispatch(setUserData(result.data))
            dispatch(setAuthModalOpen(false)) 
        } catch (error) {
            console.log(error)
            dispatch(setUserData(null))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => dispatch(setAuthModalOpen(false))} 
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()} 
                        className='w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl relative'
                    >
                        <button 
                            onClick={() => dispatch(setAuthModalOpen(false))}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer"
                        >
                            <IoClose size={20} />
                        </button>

                        <div className='flex items-center justify-center gap-3 mb-6'>
                            <div className='bg-black text-white p-2 rounded-lg'>
                                <BsRobot size={18} />
                            </div>
                            <h2 className='font-semibold text-lg'>Interviewer.ai</h2>
                        </div>

                        <h1 className='text-2xl md:text-3xl font-semibold text-center mb-4'>
                            Continue With
                            <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2 ml-2'>
                                <IoSparkles size={16}/>
                                AI Smart Interview
                            </span>
                        </h1>

                        <p className='text-gray-500 text-center text-sm md:text-base mb-8'>
                            Sign in to start AI-powered mock interviews, track your progress, and unlock detailed performance insights
                        </p>

                        <button
                            onClick={handleGoogleAuth}
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-3 py-3 rounded-full shadow-md transition cursor-pointer ${
                                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            <FcGoogle size={20}/> 
                            {isLoading ? "Connecting..." : "Continue With Google"}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default AuthModal