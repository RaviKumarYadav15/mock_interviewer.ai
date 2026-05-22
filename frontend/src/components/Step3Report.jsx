import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { resetInterview, setReportData } from '../redux/interviewSlice';
import { motion } from 'motion/react';
import { FaCheckCircle, FaExclamationTriangle, FaDownload, FaColumns, FaThumbsUp, FaLightbulb } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { serverUrl } from '../App.jsx';

function Step3Report() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isLoading, setIsLoading] = useState(true);
    const report = useSelector((state) => state.interview.reportData);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(serverUrl + `/api/interview/report/${id}`, {
                    withCredentials: true
                });
                dispatch(setReportData(res.data));
            } catch (error) {
                console.error("Failed to fetch report", error);
                navigate('/dashboard'); 
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id, dispatch, navigate]);

    if (isLoading || !report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
                <div className="animate-pulse flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    const questionsArray = report.questions || report.questionWiseScore || [];
    const role = report.role || "Mock Interview";
    const mode = report.mode || "Technical";

    const strengths = Array.isArray(report.strengths) ? report.strengths : [];
    const weaknesses = Array.isArray(report.weaknesses) ? report.weaknesses : [];

    const getAvg = (key) => {
        if (report[key] !== undefined) return report[key];
        if (!questionsArray.length) return 0;
        const total = questionsArray.reduce((sum, q) => sum + (q[key] || 0), 0);
        return total / questionsArray.length;
    };

    const finalScore = report.finalScore !== undefined ? report.finalScore : getAvg('score');
    const confidence = getAvg('confidence');
    const communication = getAvg('communication');
    const correctness = getAvg('correctness');

    const score = Math.round(finalScore);
    const percentage = Math.round((score / 10) * 100);

    const questionScoreData = questionsArray.map((q, index) => ({
        name: `Q${index + 1}`,
        score: Math.round(q.score || 0)
    }));

    const skills = [
        { label: "Confidence", value: Math.round(confidence) },
        { label: "Communication", value: Math.round(communication) },
        { label: "Correctness", value: Math.round(correctness) },
    ];

    let performanceText = "";
    let shortTagline = "";
    let advice = "";

    if (score >= 8) {
        performanceText = "Ready for job opportunities.";
        shortTagline = "Excellent clarity and structured responses.";
        advice = "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (score >= 5) {
        performanceText = "Needs minor improvement.";
        shortTagline = "Good foundation, refine articulation.";
        advice = "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
        performanceText = "Significant practice required.";
        shortTagline = "Focus on structuring answers and correctness.";
        advice = "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
    }

    const downloadPDF = () => {
        const doc = new jsPDF("p", "mm", "a4");
        const margin = 15;
        const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
        let currentY = 20;

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 58, 138); 
        doc.text("Interview Performance Report", doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
        
        currentY += 8;
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); 
        doc.text(`Role: ${role}  |  Mode: ${mode}  |  Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });

        currentY += 6;
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, doc.internal.pageSize.getWidth() - margin, currentY);
        
        currentY += 10;

        // Score and Skills Widget
        doc.setFillColor(239, 246, 255); 
        doc.roundedRect(margin, currentY, 60, 25, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.text("Final Score", margin + 30, currentY + 10, { align: "center" });
        doc.setFontSize(20);
        doc.text(`${score}/10`, margin + 30, currentY + 20, { align: "center" });

        doc.setFillColor(248, 250, 252); 
        doc.roundedRect(margin + 65, currentY, contentWidth - 65, 25, 3, 3, "F");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(`Confidence: ${Math.round(confidence)}/10`, margin + 70, currentY + 8);
        doc.text(`Communication: ${Math.round(communication)}/10`, margin + 70, currentY + 15);
        doc.text(`Correctness: ${Math.round(correctness)}/10`, margin + 70, currentY + 22);

        currentY += 30;

        // Professional Advice
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225); 
        doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 58, 138);
        doc.text("AI Professional Advice:", margin + 5, currentY + 7);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const splitAdvice = doc.splitTextToSize(advice, contentWidth - 10);
        doc.text(splitAdvice, margin + 5, currentY + 13);

        currentY += 28;

        // Dynamic Strengths and Weaknesses List
        if (strengths.length > 0 || weaknesses.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(30, 58, 138);
            doc.text("AI Professional Evaluation", margin, currentY);
            currentY += 7;

            doc.setFontSize(10);
            doc.setTextColor(21, 128, 61); // Green
            doc.text("Core Strengths:", margin, currentY);
            currentY += 5;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            strengths.forEach(s => {
                const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 5);
                doc.text(lines, margin + 2, currentY);
                currentY += (lines.length * 5);
            });

            currentY += 3;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(194, 65, 12); // Orange/Red
            doc.text("Areas for Improvement:", margin, currentY);
            currentY += 5;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(71, 85, 105);
            weaknesses.forEach(w => {
                const lines = doc.splitTextToSize(`• ${w}`, contentWidth - 5);
                doc.text(lines, margin + 2, currentY);
                currentY += (lines.length * 5);
            });
            
            currentY += 8;
        }

        const tableData = questionsArray.map((q, i) => [
            i + 1,
            `Q: ${q.question}\n\nCandidate Answer:\n${q.answer || "No answer provided"}\n\nAI Feedback:\n${q.feedback || "No feedback generated."}`,
            `${Math.round(q.score || 0)}/10` 
        ]);

        autoTable(doc, {
            startY: currentY,
            margin: { left: margin, right: margin },
            head: [['#', 'Transcript & Evaluation', 'Score']],
            body: tableData,
            styles: { fontSize: 9, cellPadding: 5, valign: 'top' },
            headStyles: { fillColor: [30, 58, 138], textColor: 255, halign: 'center' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' } }
        });

        doc.save(`Interview_Report_${role.replace(/\s+/g, '_')}.pdf`);
    };

    const handleDashboardNavigation = () => {
        dispatch(resetInterview());
        navigate('/dashboard'); 
    };

    return (
        <div className='min-h-screen bg-[#f3f3f3] rounded-3xl px-4 py-10'>
            <div className="max-w-6xl mx-auto space-y-8 p-6 rounded-4xl">
                
                {/* HEADER */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                        <h1 className='text-3xl font-extrabold flex-nowrap text-slate-900'>Interview Analytics</h1>
                        <p className='text-slate-500 mt-1 font-medium'>AI-powered performance insights</p>
                    </div>

                    <div className='flex items-center gap-3 w-full sm:w-auto'>
                        <button onClick={handleDashboardNavigation} className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2">
                            <FaColumns size={14} /> Dashboard
                        </button>
                        <button onClick={downloadPDF} className="flex-1 sm:flex-none bg-blue-950 text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md shadow-blue-900/20 cursor-pointer flex items-center justify-center gap-2">
                            <FaDownload size={14} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Score and Skills */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
                        <div className='relative w-36 h-36 mx-auto'>
                            <CircularProgressbar value={percentage} text={`${score}/10`} styles={buildStyles({ textSize: '18px', pathColor: '#1e3a8a', textColor: '#1e3a8a', trailColor: '#f1f5f9' })} />
                        </div>
                        <p className="text-slate-400 mt-4 text-sm font-bold uppercase tracking-wider">Overall Score</p>
                        <div className="mt-6 border-t border-slate-100 pt-5">
                            <p className="font-bold text-slate-800 text-lg">{performanceText}</p>
                            <p className="text-slate-500 text-sm mt-1">{shortTagline}</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Skill Evaluation</h3>
                        <div className='space-y-6'>
                            {skills.map((s, i) => (
                                <div key={i}>
                                    <div className='flex justify-between mb-2 text-sm'>
                                        <span className="font-semibold text-slate-600">{s.label}</span>
                                        <span className='font-bold text-blue-900'>{s.value}/10</span>
                                    </div>
                                    <div className='bg-slate-100 h-2.5 rounded-full overflow-hidden'>
                                        <div className='bg-blue-600 h-full rounded-full transition-all duration-1000' style={{ width: `${(s.value / 10) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* STRENGTHS and WEAKNESSES */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
                        <div className="bg-emerald-50 rounded-3xl shadow-sm border border-emerald-100 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                <FaThumbsUp /> Core Strengths
                            </h3>
                            <ul className="space-y-3">
                                {strengths.length > 0 ? strengths.map((strength, i) => (
                                    <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm sm:text-base leading-relaxed">
                                        <span className="mt-1.5 text-emerald-500">•</span> {strength}
                                    </li>
                                )) : <li className="text-emerald-700 italic text-sm">No strengths recorded.</li>}
                            </ul>
                        </div>

                        <div className="bg-amber-50 rounded-3xl shadow-sm border border-amber-100 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <FaLightbulb /> Areas for Improvement
                            </h3>
                            <ul className="space-y-3">
                                {weaknesses.length > 0 ? weaknesses.map((weakness, i) => (
                                    <li key={i} className="flex items-start gap-2 text-amber-800 text-sm sm:text-base leading-relaxed">
                                        <span className="mt-1.5 text-amber-500">•</span> {weakness}
                                    </li>
                                )) : <li className="text-amber-700 italic text-sm">No areas for improvement recorded.</li>}
                            </ul>
                        </div>
                    </motion.div>
                )}

                {/* AREA CHART */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col'>
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend</h3>
                    <div className='w-full h-75 sm:h-60 mt-2'>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={questionScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="score" stroke="#1e3a8a" strokeWidth={3} fill="#dbeafe" activeDot={{ r: 6, fill: '#1e3a8a', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* DETAILED QUESTION BREAKDOWN */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-5 pt-4">
                    <h2 className="text-xl font-bold text-slate-800 px-2">Detailed Transcript & Feedback</h2>
                    {questionsArray.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500">No questions were answered.</div>
                    ) : (
                        questionsArray.map((q, index) => {
                            const roundedScore = Math.round(q.score || 0);
                            return (
                                <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                                        <h3 className="font-semibold text-base sm:text-lg flex-1 pr-4">Q{index + 1}: {q.question}</h3>
                                        <div className="bg-slate-800 px-4 py-1 rounded-full text-blue-400 font-bold border border-slate-700 whitespace-nowrap">{roundedScore}/10</div>
                                    </div>
                                    <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Answer</h4>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm min-h-30">
                                                {q.answer ? q.answer : <span className="italic text-slate-400">No answer provided / Time limit exceeded.</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">AI Feedback</h4>
                                            <div className={`p-4 rounded-xl border leading-relaxed text-sm min-h-30 ${roundedScore >= 7 ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                                                <div className="flex gap-3">
                                                    {roundedScore >= 7 ? <FaCheckCircle className="text-green-500 text-lg shrink-0 mt-0.5" /> : <FaExclamationTriangle className="text-amber-500 text-lg shrink-0 mt-0.5" />}
                                                    <p>{q.feedback || "No feedback generated for this question."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </motion.div>
            </div>
        </div>
    );
}

export default Step3Report;