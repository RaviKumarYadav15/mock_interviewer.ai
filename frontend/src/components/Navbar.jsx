import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { BsRobot, BsCoin } from 'react-icons/bs'
import { FaUserAstronaut } from 'react-icons/fa'
import { HiOutlineLogout } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App.jsx'
import { setUserData, setAuthModalOpen } from '../redux/userSlice.js'
import axios from 'axios'

const Navbar = () => {
    const { userData } = useSelector((state) => state.user)

    const [showCreditPopUp, setShowCreditPopUp] = useState(false)
    const [showUserPopUp, setShowUserPopUp] = useState(false)

    const navRef = useRef(null)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setShowCreditPopUp(false)
                setShowUserPopUp(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

      const handleCredit = () => {
        if (!userData) dispatch(setAuthModalOpen(true))
        else navigate('/pricing')
    }

    const handleLogout = async () => {
        try {
            await axios.post(
                serverUrl + "/api/auth/logout",
                {},
                { withCredentials: true }
            )

            dispatch(setUserData(null))

            setShowCreditPopUp(false)
            setShowUserPopUp(false)

            navigate("/")

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full max-w-6xl bg-linear-to-r from-blue-50 via-blue-100 to-blue-50 rounded-3xl shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative transition-all duration-300'            >

                <div
                    onClick={() => navigate('/')}
                    className='flex items-center gap-3 cursor-pointer'
                >
                    <div className='bg-linear-to-r from-blue-400 to-blue-700 text-white rounded-lg p-2'>
                        <BsRobot size={20} />
                    </div>

                    <h1 className='font-semibold text-lg'>
                        Interviewer.ai
                    </h1>
                </div>

                <div ref={navRef} className='flex items-center gap-6 relative'>

                    <div className='relative flex flex-col items-end'>
                        <button
                            onClick={() => {
                                setShowCreditPopUp(!showCreditPopUp)
                                setShowUserPopUp(false)
                            }}
                            className='flex items-center gap-2 bg-linear-to-b from-yellow-700 to-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-md hover:from-yellow-100 hover:to-yellow-700 transition-all duration-300 cursor-pointer'                        >
                            <BsCoin size={20} />
                            {userData?.credits || 0}
                        </button>

                        {showCreditPopUp && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='absolute top-full mt-3 right-0 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-52 z-50'
                            >
                                <h3 className='font-semibold text-gray-800 mb-1'>
                                    Credits Balance
                                </h3>

                                <p className='text-sm text-gray-500 mb-3'>
                                    You have {userData?.credits || 0} credits
                                </p>

                                <button
                                    onClick={handleCredit}
                                    className='w-full bg-linear-to-br from-yellow-100 to-yellow-700 text-white text-sm py-2 rounded-lg hover:bg-gray-800 transition cursor-p'
                                >
                                    Buy More Credits
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <div className='relative flex flex-col items-end'>
                        <button
                            onClick={() => {
                                setShowUserPopUp(!showUserPopUp)
                                setShowCreditPopUp(false)
                            }}
                            className='w-9 h-9 bg-linear-to-r from-blue-400 to-blue-700 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer hover:scale-105 transition'
                        >
                            {userData
                                ? userData?.name?.slice(0, 1).toUpperCase()
                                : <FaUserAstronaut />
                            }
                        </button>

                        {showUserPopUp && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='absolute top-full mt-3 right-0 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-60 z-50'
                            >
                                {userData ? (
                                    <>
                                        <div className='mb-3 border-b border-gray-100 pb-3'>
                                            <p className='font-semibold text-gray-800 truncate'>
                                                {userData?.name}
                                            </p>

                                            <p className='text-xs text-gray-500 truncate'>
                                                {userData?.email}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowUserPopUp(false)
                                                navigate("/dashboard")
                                            }}
                                            className='w-full text-left text-sm py-2 px-2 mb-1 hover:text-black text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition'
                                        >
                                            Dashboard
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className='w-full flex items-center gap-2 text-red-600 text-sm font-medium py-2 px-2 hover:bg-red-50 rounded-lg cursor-pointer transition'
                                        >
                                            <HiOutlineLogout size={18} />
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className='mb-3 border-b border-gray-100 pb-3 text-center md:text-left'>
                                            <p className='font-semibold text-gray-800'>
                                                Guest User
                                            </p>

                                            <p className='text-xs text-gray-500'>
                                                Sign in to save your progress
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowUserPopUp(false)
                                                dispatch(setAuthModalOpen(true))
                                            }}
                                            className='w-full bg-black text-white text-sm font-medium py-2 px-3 rounded-lg cursor-pointer text-center hover:bg-gray-800 transition'
                                        >
                                            Log In
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>

            </motion.div>
        </div>
    )
}

export default Navbar