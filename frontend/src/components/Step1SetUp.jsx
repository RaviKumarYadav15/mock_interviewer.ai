import { useState } from 'react';
import { motion } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, setInterviewData } from '../redux/interviewSlice';
import { setUserData } from '../redux/userSlice';
import axios from 'axios';
import { 
    FaUserTie, 
    FaBriefcase, 
    FaFileUpload, 
    FaMicrophoneAlt, 
    FaChartLine
} from "react-icons/fa";
import { serverUrl } from '../App.jsx';

const Step1SetUp = () => {
    const dispatch = useDispatch();

    const {userData} = useSelector((state)=> state.user);

    // Form State
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [voicePreference, setVoicePreference] = useState("Random");
    
    // Resume Analysis State
    const [resumeFile, setResumeFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");

    const [loading,setLoading] = useState(false);

    const features = [
        {
            icon: <FaUserTie className="text-blue-600 text-xl" />,
            text: "Choose Role & Experience",
        },
        {
            icon: <FaMicrophoneAlt className="text-blue-600 text-xl" />,
            text: "Smart Voice Interview",
        },
        {
            icon: <FaChartLine className="text-blue-600 text-xl" />,
            text: "Performance Analytics",
        }
    ];

    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true);
        
        try {
            const formData = new FormData();
            formData.append("resume", resumeFile); 

            const result = await axios.post(serverUrl + "/api/interview/resume", formData, {
                withCredentials: true
            });

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);
            
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze resume. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

const handleStart = async (e) => {
        e.preventDefault();
        if (loading) return; 
        setLoading(true);
        try {
            // generate 5 questions
            const result = await axios.post(serverUrl + "/api/interview/generate-questions", {
                role,
                experience,
                voicePreference,
                mode,
                resumeText,
                projects,
                skills
            }, { withCredentials: true });

            // Update user's credits in Redux
            if (userData) {
                dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }));
            }

            // Save all form data also generated questions
            dispatch(setInterviewData({ 
                role, 
                experience, 
                mode, 
                resumeText, 
                projects, 
                skills,
                interviewId: result.data.interviewId,
                questions: result.data.questions ,
                voicePreference: result.data.voicePreference 
            }));
            
            // Now move to Step 2
            dispatch(setStep(2));

        } catch (error) {
            console.error("Failed to start interview:", error);
            alert(error.response?.data?.message || "Something went wrong generating questions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4 py-12"
        >
            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden border border-gray-100">
                
                {/* Left Side: Info */}
                <motion.div 
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="relative bg-linear-to-br from-orange-200 via-white to-green-200 p-12 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">
                        Start Your AI <br/> Interview
                    </h2>
                    <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-md">
                        Practice real interview scenarios powered by AI. 
                        Improve communication, technical skills, and confidence.
                    </p>
                    <div className="space-y-5">
                        {features.map((item, index) => (
                            <motion.div 
                                key={index}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                                whileHover={{ scale: 1.03 }}
                                className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm border border-blue-50"
                            >
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    {item.icon}
                                </div>
                                <span className="text-gray-700 font-medium">
                                    {item.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div 
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="p-12 bg-white flex flex-col justify-center"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">
                        Interview SetUp
                    </h2>
                    <form onSubmit={handleStart} className="space-y-6">
                        
                        <div className="relative">
                            <FaUserTie className="absolute top-4 left-4 text-gray-400 text-lg" />
                            <input 
                                type="text" 
                                placeholder="Enter role (e.g. Software Engineer)"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50"
                            />
                        </div>

                        <div className="relative">
                            <FaBriefcase className="absolute top-4 left-4 text-gray-400 text-lg" />
                            <input 
                                type="text" 
                                placeholder="Experience (e.g. 2 years)"
                                required
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interview Mode</label>
                            <select 
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50 appearance-none cursor-pointer"
                            >
                                <option value="Technical">Technical Interview</option>
                                <option value="HR">HR Interview</option>
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer Voice</label>
                            <select 
                                value={voicePreference}
                                onChange={(e) => setVoicePreference(e.target.value)}
                                className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50 appearance-none cursor-pointer"
                            >
                                <option value="Random">Random</option>
                                <option value="Male">Male Interviewer</option>
                                <option value="Female">Female Interviewer</option>
                            </select>
                        </div>

                        {/* Resume */}
                        {!analysisDone ? (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
                            >
                                <FaFileUpload className="text-4xl mx-auto text-blue-600 mb-3" />
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className="hidden"
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                />
                                <p className="text-gray-600 font-medium text-sm">
                                    {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                                </p>
                                {resumeFile && (
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadResume();
                                        }}
                                        disabled={analyzing || loading}
                                        className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4"
                            >
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Resume Analysis Result
                                </h3>
                                
                                {projects.length > 0 && (
                                    <div>
                                        <p className="font-medium text-gray-700 mb-1">Projects:</p>
                                        <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className="font-medium text-gray-700 mb-1">Skills:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {skills.map((s, i) => (
                                                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={!role || !experience || analyzing || loading}
                            className="w-full bg-blue-600 text-white font-semibold text-lg py-4 rounded-full hover:bg-blue-700 transition duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"                        >
                            {loading && (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {loading ? "Generating Questions..." : "Start Interview"}
                        </motion.button>
                        
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Step1SetUp;