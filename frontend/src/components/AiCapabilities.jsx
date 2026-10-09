import { motion } from 'motion/react'

const AiCapabilities = () => {
    const capabilities = [
        {
            title: "AI Answer Evaluation",
            desc: "Scores communication, technical accuracy, and confidence"
        },
        {
            title: "Resume Based Interview",
            desc: "Project-specific questions based on your uploaded resume"
        },
        {
            title: "Downloadable PDF Report",
            desc: "Detailed strengths, weaknesses, and improvement insights"
        },
        {
            title: "History & Analytics",
            desc: "Track your progress with performance graph analysis"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto mb-32 px-4 md:px-6">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className='text-3xl md:text-4xl font-semibold text-center mb-20'
            >
                Advanced AI{" "}
                <span className="text-blue-600">Capabilities</span>
            </motion.h2>

            <div className="relative">
                {/* Horizontal Connecting Line (Desktop only) */}
                <div className="hidden md:block absolute top-[23px] left-[12.5%] right-[12.5%] h-[2px] bg-blue-200 z-0"></div>

                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-6 relative z-10">
                    {capabilities.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center flex-1"
                        >
                            {/* Number Circle */}
                            <div className="w-12 h-12 bg-white rounded-full border-[3px] border-blue-600 text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm mb-6 z-10 relative">
                                {index + 1}
                            </div>

                            {/* Content Card */}
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-50 text-center w-full h-full flex flex-col justify-start">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
        </div>
    )
}

export default AiCapabilities