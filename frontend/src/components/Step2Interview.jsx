import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { setReportData } from '../redux/interviewSlice';
import { FaStopCircle, FaSpinner, FaVolumeUp, FaCheckCircle, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import Timer from './Timer';

import maleVideo from '../assets/Videos/male-ai.mp4';
import femaleVideo from '../assets/Videos/female-ai.mp4';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App.jsx';

function Step2Interview() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { interviewData } = useSelector((state) => state.interview);
    const { userData } = useSelector((state) => state.user);
    
    const questions = interviewData?.questions || [];
    const interviewId = interviewData?.interviewId;
    const userName = userData?.name?.split(" ")[0] || "there"; 

    // voice preference
    const [isMaleInterviewer] = useState(() => {
        if (interviewData?.voicePreference === "Male") return true;
        if (interviewData?.voicePreference === "Female") return false;
        return Math.random() > 0.5; 
    });
    
    // Find first unanswered question to support resuming
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (!questions || questions.length === 0) return 0;
        const firstUnansweredIndex = questions.findIndex(q => !q.answer || q.answer.trim() === "");
        return firstUnansweredIndex !== -1 ? firstUnansweredIndex : questions.length - 1;
    });

    const [currentAnswer, setCurrentAnswer] = useState("");
    
    const [isIntro, setIsIntro] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [subtitle, setSubtitle] = useState("");
    
    const currentQ = questions[currentIndex] || {};
    const [timeLeft, setTimeLeft] = useState(currentQ.timeLimit || 60);
    
    const videoRef = useRef(null);
    const recognitionRef = useRef(null);
    const isMounted = useRef(true); 
    const isFinishingRef = useRef(false);
    
    const [systemVoices, setSystemVoices] = useState([]);

    useEffect(() => {
        isFinishingRef.current = isFinishing;
    }, [isFinishing]);

    useEffect(() => {
        const loadVoices = () => {
            if (window.speechSynthesis) setSystemVoices(window.speechSynthesis.getVoices());
        };
        loadVoices();
        if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!isMounted.current || !window.speechSynthesis) return resolve();
            
            window.speechSynthesis.cancel(); 
            
            const humanText = " ... " + text.replace(/,/g, " ... ").replace(/\./g, " ... ");
            const utterance = new SpeechSynthesisUtterance(humanText);
            
            let matchingVoice = systemVoices.find(v => 
                !isMaleInterviewer 
                    ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha")
                    : v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google us english")
            );

            if (matchingVoice) utterance.voice = matchingVoice;
            utterance.pitch = !isMaleInterviewer ? 1.2 : 0.85; 
            utterance.rate = 0.95;

            utterance.onstart = () => { 
                if (!isMounted.current) return;
                setIsSpeaking(true); 
                setSubtitle(text); 
                videoRef.current?.play().catch(() => {}); 
            };
            
            const cleanup = () => {
                if (videoRef.current) {
                    videoRef.current.pause(); 
                    videoRef.current.currentTime = 0; 
                }
                setIsSpeaking(false);
                setTimeout(() => {
                    if (isMounted.current) setSubtitle("");
                    resolve();
                }, 300);
            };

            utterance.onend = cleanup;
            utterance.onerror = cleanup;

            setTimeout(() => {
                if (isMounted.current) window.speechSynthesis.speak(utterance);
            }, 200);
        });
    };

    useEffect(() => {
        const runIntro = async () => {
            if (systemVoices.length === 0 || !isMounted.current) return;
    
            if (currentIndex > 0) {
                await speakText(`Welcome back, ${userName}. Let's continue where we left off.`);
                if (isMounted.current) setIsIntro(false);
                return;
            }
            
            await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
            await new Promise(r => setTimeout(r, 500)); 
            await speakText("I'll ask you a few questions. Just answer confidently, and take your time. Let's begin.");
            
            if (isMounted.current) setIsIntro(false);
        };
        runIntro();
    }, [systemVoices]); 

    // Handle component unmount and browser close events
    useEffect(() => {
        isMounted.current = true;

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "You have an ongoing interview. If you leave, your progress will be lost.";
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            isMounted.current = false; 
            
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
        };
    }, []);

    useEffect(() => {
        if (isIntro || isTransitioning || !isMounted.current) return;
        
        const askQuestion = async () => {
            if (currentIndex === questions.length - 1 && questions.length > 1) {
                await speakText("Alright, this one might be a bit more challenging.");
                await new Promise(r => setTimeout(r, 400));
            }
            if (currentQ.question) await speakText(currentQ.question);
        };

        askQuestion();

        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [currentIndex, isIntro, isTransitioning]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert("Speech Recognition is not supported in this browser.");

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let newTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) newTranscript += event.results[i][0].transcript + " ";
            }
            setCurrentAnswer(prev => prev + newTranscript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    useEffect(() => setTimeLeft(currentQ.timeLimit || 60), [currentIndex, currentQ.timeLimit]);

    useEffect(() => {
        if (isIntro || isTransitioning || isSubmitting || isFinishing) return;
        
        if (timeLeft <= 0) {
            handleNext(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isIntro, isTransitioning, isSubmitting, isFinishing]);

    const handleNext = async (isAutoTimeout = false) => {
        if (!isAutoTimeout && (!currentAnswer.trim() || isSubmitting)) return;
        
        window.speechSynthesis.cancel(); 
        if (isListening) toggleListening(); 
        setIsSubmitting(true);

        try {
            await axios.post(serverUrl + "/api/interview/submit-answer", {
                interviewId, 
                questionIndex: currentIndex, 
                answer: currentAnswer, 
                timeTaken: (currentQ.timeLimit || 60) - timeLeft
            }, { withCredentials: true });

            if (!isMounted.current) return;
            
            setIsSubmitting(false);
            setIsTransitioning(true); 
            
            if (currentIndex === questions.length - 1) {
                await speakText("Thank you, that concludes our questions for today. Please wait while I finalize your report.");
                await handleFinish();
            } else {
                const transitionPhrases = [
                    "Alright, let's move to the next question.",
                    "Understood. Let's dive into another scenario.",
                    "Makes sense. Moving on.",
                    "Thanks for sharing that. Next question.",
                    "Alright, let's explore another topic.",
                    "Okay, now I'd like to ask something different.",
                    "Thank you. Let's proceed.",
                    "Got it. Moving forward.",
                    "Noted. Let's move to the next question.",
                    "Okay, continuing with the interview.",
                    "Thank you for your response. Let's proceed.",
                    "Let's move on to the next item.",
                    "Alright, moving along.",
                    "Okay, let's transition to the next topic.",
                    "Good explanation there. Moving ahead.",
                    "Interesting perspective. Let's continue.",
                    "Nice, now onto something slightly different.",
                    "Fair answer. Let's keep going.",
                    "That was well structured. Next question.",
                    "Good point. Let's shift gears a little.",
                    "Solid response. Let's continue the interview.",
                    "Nicely explained. Let's move forward.",
                    "Great. Let's continue with the next one."
                ];
                
                const randomTransition = transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];
                await speakText(randomTransition);

                if (!isMounted.current) return;
                await new Promise(r => setTimeout(r, 600)); 
                
                const nextTimeLimit = questions[currentIndex + 1]?.timeLimit || 60;
                setTimeLeft(nextTimeLimit);

                setCurrentIndex(i => i + 1);
                setCurrentAnswer("");
                setIsTransitioning(false); 
            }
        } catch (err) {
            alert("Failed to save answer.");
            setIsSubmitting(false);
        }
    };

    const handleFinish = async () => {
        window.speechSynthesis.cancel();
        if (isListening) toggleListening();
        setIsFinishing(true);
        
        try {
            const res = await axios.post(serverUrl  +"/api/interview/finish", { interviewId }, { withCredentials: true });            
            dispatch(setReportData(res.data));
            navigate(`/report/${interviewData.interviewId}`);
        } catch (error) {
            console.error("Failed to finish interview", error);
            alert("Something went wrong while generating your report.");
        }
    };

    const handleEndEarly = () => {
        const isConfirmed = window.confirm("Are you sure you want to end early? Unanswered questions will receive 0 points, but your current answers will be evaluated.");
        if (isConfirmed) {
            handleFinish();
        }
    };

    if (isFinishing) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <FaCheckCircle className="text-emerald-500 text-6xl mb-6 animate-bounce" />
            <h2 className="text-3xl font-bold text-slate-800">Interview Completed!</h2>
            <p className="text-slate-500 mt-2 font-medium">AI is evaluating your final transcript and generating your report...</p>
        </div>
    );

    if (!questions.length) return <div className="text-center mt-20 font-bold">No questions found.</div>;

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 relative">
            <div className={`w-full max-w-6xl transition-all duration-700 bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row overflow-hidden border border-slate-200 ${isIntro ? 'min-h-[50vh] justify-center items-center p-12' : 'min-h-[85vh]'}`}>
                
                <motion.div 
                    layout 
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    className={`flex flex-col items-center justify-center gap-6 transition-all duration-700 ${isIntro ? 'w-full max-w-lg p-4' : 'w-full lg:w-[40%] bg-slate-900 p-8 gap-8'}`}
                >
                    <div className={`relative transition-all duration-500 ${isIntro ? 'w-full max-w-md scale-105' : 'w-full max-w-sm'}`}>
                        <motion.video 
                            layout
                            ref={videoRef}
                            src={isMaleInterviewer ? maleVideo : femaleVideo}
                            muted playsInline loop
                            className={`rounded-2xl object-cover w-full shadow-lg transition-opacity duration-300 ${isSpeaking ? 'ring-4 ring-emerald-500 opacity-100' : 'opacity-60 ring-1 ring-slate-700'}`}
                        />
                        
                        <AnimatePresence>
                            {subtitle && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md text-white p-3 rounded-xl text-sm text-center border border-white/10 shadow-xl z-10 font-medium"
                                >
                                    {subtitle}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isIntro && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm bg-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-lg relative">
                            
                            <div className="w-full flex justify-between items-center mb-2">
                                <span className={`font-bold tracking-wide ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}>
                                    {isSpeaking ? 'AI Speaking...' : (isTransitioning ? 'Processing...' : 'Listening...')}
                                </span>
                                
                                <button 
                                    onClick={() => speakText(currentQ.question)} 
                                    disabled={isTransitioning || isSpeaking} 
                                    className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-emerald-400 rounded-full transition disabled:opacity-50" 
                                    title="Listen Again"
                                >
                                    <FaVolumeUp size={16} />
                                </button>
                            </div>

                            <Timer timeLeft={timeLeft} totalTime={currentQ.timeLimit || 60} />
                            
                            <div className="text-center mt-2 border-t border-slate-700 pt-4 w-full">
                                <span className="text-2xl font-bold text-white">{currentIndex + 1}</span>
                                <span className="text-slate-400 text-lg"> / {questions.length}</span>
                            </div>
                        </motion.div>
                    )}

                    {isIntro && (
                        <h2 className="text-2xl font-bold text-slate-800 text-center animate-pulse mt-4">
                            Initializing Interview Panel Presentation...
                        </h2>
                    )}
                </motion.div>

                {!isIntro && (
                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col p-8 lg:p-10 bg-white">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">Your Response</h2>
                            <button onClick={handleEndEarly} className="text-slate-400 hover:text-red-500 flex items-center gap-2 font-bold transition cursor-pointer text-sm" title="Terminate Assessment">
                                <FaStopCircle /> End Early
                            </button>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                                
                                <div className="bg-slate-50 p-6 rounded-2xl shadow-sm mb-6 border border-slate-200 text-lg font-medium text-slate-800 leading-relaxed min-h-[100px] flex items-center justify-center text-center">
                                    {currentQ.question}
                                </div>
                                
                                <div className="relative flex-1 flex flex-col">
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        disabled={isSubmitting || isTransitioning}
                                        placeholder={isListening ? "Listening... Speak now!" : "Type your detailed answer or click the mic to speak..."}
                                        className={`flex-1 w-full bg-white p-6 rounded-2xl outline-none border transition-all resize-none text-lg min-h-[200px] shadow-sm disabled:bg-slate-50 ${isListening ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'}`}
                                    />
                                    {isListening && (
                                        <span className="absolute top-4 right-4 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex items-center gap-4 mt-8">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleListening}
                                disabled={isTransitioning || isSubmitting}
                                className={`w-16 h-14 flex items-center justify-center rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-red-50 text-red-500 ring-2 ring-red-400/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {isListening ? <FaMicrophone size={22} className="animate-pulse" /> : <FaMicrophoneSlash size={22} />}
                            </motion.button>

                            <button 
                                onClick={() => handleNext(false)}
                                disabled={!currentAnswer.trim() || isSubmitting || isTransitioning}
                                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none flex justify-center items-center h-14 transition cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin text-2xl" /> : (currentIndex === questions.length - 1 ? "Submit Interview" : "Next Question")}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default Step2Interview;
