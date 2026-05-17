import { motion } from 'motion/react'
import { BsRobot, BsMic, BsClock } from 'react-icons/bs'

const Process = () => {
    const steps = [
        {
            icon: <BsRobot size={24} />,
            step: "STEP 1",
            title: "Role & Experience Selection",
            desc: "AI adjusts difficulty based on selected job role."
        },
        {
            icon: <BsMic size={24} />,
            step: "STEP 2",
            title: "Smart Voice Interview",
            desc: "Dynamic follow-up questions based on your answers."
        },
        {
            icon: <BsClock size={24} />,
            step: "STEP 3",
            title: "Timer Based Simulation",
            desc: "Real interview pressure with time tracking."
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto mt-24">
            <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28 mt-16 md:mt-0'>
                {steps.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 + index * 0.2 }}
                        whileHover={{ scale: 1.06 }}
                        className='relative bg-white rounded-3xl border-2 border-blue-100 hover:border-blue-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col items-center mt-12 md:mt-0'
                    >
                        <div className="absolute -top-8 w-16 h-16 bg-white rounded-2xl border border-blue-50 shadow-lg flex items-center justify-center text-blue-500">
                            {item.icon}
                        </div>

                        <div className='pt-6 text-center'>
                            <div className='text-xs text-blue-600 font-semibold mb-2 tracking-wider'>
                                {item.step}
                            </div>
                            <h3 className='font-semibold mb-3 text-lg text-gray-800'>
                                {item.title}
                            </h3>
                            <p className='text-sm text-gray-500 leading-relaxed'>
                                {item.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
export default Process