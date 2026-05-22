import { motion } from 'motion/react'
import { BsBarChart, BsFileEarmarkText } from "react-icons/bs"

const AiCapabilities = () => {
    const capabilities = [
        {
            image: "/ai-ans.png",
            icon: <BsBarChart size={20} />,
            title: "AI Answer Evaluation",
            desc: "Scores communication, technical accuracy, and confidence."
        },
        {
            image: "/resume.png",
            icon: <BsFileEarmarkText size={20} />,
            title: "Resume Based Interview",
            desc: "Project-specific questions based on your uploaded resume."
        },
        {
            image: "/pdf.png",
            icon: <BsFileEarmarkText size={20} />,
            title: "Downloadable PDF Report",
            desc: "Detailed strengths, weaknesses, and improvement insights."
        },
        {
            image: "/pdf.png", 
            icon: <BsBarChart size={20} />,
            title: "History & Analytics",
            desc: "Track your progress with performance graph analysis."
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto mb-32">
            
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className='text-3xl md:text-4xl font-semibold text-center mb-16'
            >
                Advanced AI{" "}
                <span className="text-blue-600">Capabilities</span>
            </motion.h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0'>
                {capabilities.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className='bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 group cursor-pointer'
                    >
                        <div className='flex-1 flex flex-col text-center sm:text-left w-full'>
                            <div className='flex items-center justify-center sm:justify-start gap-4 mb-3'>
                                <div className='bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0'>
                                    {item.icon}
                                </div>
                                <h3 className='text-lg font-bold text-gray-800 leading-tight'>
                                    {item.title}
                                </h3>
                            </div>
                            <p className='text-gray-500 text-sm leading-relaxed'>
                                {item.desc}
                            </p>
                        </div>

                        <div className='bg-gray-50 rounded-2xl p-3 flex justify-center items-center w-28 h-28 shrink-0 border border-gray-100 group-hover:bg-blue-50 transition-colors duration-300 mt-4 sm:mt-0'>
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className='h-full w-auto object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300' 
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
            
        </div>
    )
}

export default AiCapabilities