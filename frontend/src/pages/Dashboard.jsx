import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setInterviewData, setReportData, setStep } from '../redux/interviewSlice';
import { FaTrashAlt, FaFolderOpen, FaPlus } from 'react-icons/fa';
import { serverUrl } from '../App.jsx';

function Dashboard() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await axios.get(serverUrl +"/api/interview/user", { withCredentials: true });
                setInterviews(res.data);
            } catch (error) {
                console.error("Failed to fetch interviews", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const handleResume = (interview) => {
        dispatch(setInterviewData({
            interviewId: interview._id,
            role: interview.role,
            mode: interview.mode,
            questions: interview.questions
        }));
        dispatch(setStep(2));
        navigate('/interview'); 
    };

    const handleViewReport = (interview) => {
        dispatch(setReportData(interview));
        dispatch(setStep(3));
        navigate(`/report/${interview._id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this interview record?")) return;
        
        try {
            await axios.delete(serverUrl + `/api/interview/${id}`, { withCredentials: true });
            setInterviews(prev => prev.filter(inv => inv._id !== id));
        } catch (error) {
            alert("Failed to delete interview.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3] font-medium text-slate-500 cursor-wait">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-8 h-8 text-3xl bg-linear-to-b from-blue-400 to-blue-900  rounded-full animate-bounce"></div>
                    <p className='text-3xl'>loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl p-6 mx-auto">
                
                <div className="mb-8 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1.5 text-sm font-medium">
                            Track your past interviews and complete unifinished ones
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/interview')} 
                        className="bg-linear-to-r from-blue-900 to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-900/20 cursor-pointer flex items-center gap-2"
                    >
                        <span><FaPlus size={20}/></span> New Interview
                    </button>
                </div>

                {interviews.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl shadow-sm text-center border border-slate-200">
                        <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaFolderOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No interviews yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            You haven't started any mock interviews. Click the button above to begin your first session
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {interviews.map((item) => (
                            <div 
                                key={item._id} 
                                className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                            >
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {item.role}
                                    </h3>
                                    
                                    <div className="flex items-center flex-wrap gap-2 mt-1.5 text-sm text-slate-500 font-medium">
                                        <span>{item.experience || "Experience"}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{item.mode} Mode</span>
                                    </div>
                                    
                                    <div className="mt-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                    
                                    <div className="text-center min-w-15">
                                        <p className="text-xl font-extrabold text-slate-800">
                                            {item.finalScore || 0}<span className="text-sm text-slate-400 font-semibold">/10</span>
                                        </p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">
                                            Score
                                        </p>
                                    </div>

                                    <div className="min-w-22 text-center hidden sm:block">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider border ${
                                            item.status === "completed" 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}>
                                            {item.status === "completed" ? "Completed" : "Incomplete"}
                                        </span>
                                    </div>

                                    <div className="min-w-30">
                                        {item.status === "completed" ? (
                                            <button 
                                                onClick={() => handleViewReport(item)}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
                                            >
                                                View Report
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleResume(item)}
                                                className="w-full px-4 py-2 bg-linear-to-b from-blue-500 to-blue-800 text-white text-sm font-bold rounded-xl shadow-sm shadow-blue-900/20 cursor-pointer"
                                            >
                                                Resume
                                            </button>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(item._id)} 
                                        title="Delete Interview"
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;