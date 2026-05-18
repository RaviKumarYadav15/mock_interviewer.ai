import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { resetInterview } from '../redux/interviewSlice'

import Navbar from '../components/Navbar.jsx'
import Step1SetUp from '../components/Step1SetUp.jsx'
import Step2Interview from '../components/Step2Interview.jsx'
import Step3Report from '../components/Step3Report.jsx'

const InterviewPage = () => {
  const { step } = useSelector((state) => state.interview);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(resetInterview());
    };
  }, [dispatch]);

  return (
    <div className='min-h-screen bg-[#f3f3f3] flex flex-col'>
      <Navbar />
      
      <div className='flex-1 flex flex-col p-6 max-w-6xl w-full mx-auto'>
        {step === 1 && <Step1SetUp />}
        {step === 2 && <Step2Interview />}
        {step === 3 && <Step3Report />}
      </div>
    </div>
  )
}

export default InterviewPage