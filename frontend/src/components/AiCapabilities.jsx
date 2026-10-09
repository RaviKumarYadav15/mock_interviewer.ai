import { motion } from 'motion/react'

const AiCapabilities = () => {
    const capabilities = [
        {
            title: "AI Answer Evaluation",
            desc: "Scores communication, technical accuracy, and confidence."
        },
        {
            title: "Resume Based Interview",
            desc: "Project-specific questions based on your uploaded resume."
        },
        {
            title: "Downloadable PDF Report",
            desc: "Detailed strengths, weaknesses, and improvement insights."
        },
        {
            title: "History & Analytics",
            desc: "Track your progress with performance graph analysis."
        }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mb-32 px-4 md:px-0">
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

            <div className="relative max-w-4xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-[23px] md:left-1/2 top-2 bottom-2 w-0.5 bg-blue-200 transform md:-translate-x-1/2 z-0"></div>
                
                <div className="space-y-12 md:space-y-16">
                    {capabilities.map((item, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative flex items-center w-full z-10"
                            >
                                {/* Center Dot */}
                                <div className="absolute left-[24px] md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full ring-4 ring-[#f3f3f3] shadow-sm"></div>

                                {/* Mobile Layout: Content always on the right */}
                                <div className="md:hidden w-full pl-14">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                    <p className="text-gray-500">{item.desc}</p>
                                </div>

                                {/* Desktop Layout: Alternating */}
                                <div className="hidden md:flex w-full">
                                    {isEven ? (
                                        <>
                                            <div className="w-1/2 pr-12 text-right">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                                <p className="text-gray-500">{item.desc}</p>
                                            </div>
                                            <div className="w-1/2"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-1/2"></div>
                                            <div className="w-1/2 pl-12 text-left">
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                                <p className="text-gray-500">{item.desc}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
            
        </div>
    )
}

export default AiCapabilities