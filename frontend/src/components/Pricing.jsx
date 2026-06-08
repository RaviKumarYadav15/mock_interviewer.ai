import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCoins, FaArrowLeft, FaCheckCircle, FaStar, FaRocket } from 'react-icons/fa';

const Pricing = () => {
    const navigate = useNavigate();
    
    const userData = useSelector((state) => state.user?.userData);

    const pricingPlans = [
        {
            name: "Starter Pack",
            credits: 100,
            price: "$4.99",
            features: ["2 AI Mock Interviews", "Basic Resume Analysis", "Standard Support"],
            recommended: false
        },
        {
            name: "Pro Interviewer",
            credits: 300,
            price: "$9.99",
            features: ["6 AI Mock Interviews", "Advanced PDF Reports", "Priority Support"],
            recommended: true
        },
        {
            name: "Career Mastery",
            credits: 1000,
            price: "$24.99",
            features: ["20 AI Mock Interviews", "Company Specific Paths", "Live Coding Sandbox"],
            recommended: false
        }
    ];

    return (
        <div className="w-full min-h-screen pb-20 pt-10 px-4 bg-gray-50 flex flex-col items-center relative overflow-hidden">
            <div className="fixed top-32 right-2 md:right-6 z-50 animate-bounce cursor-pointer">
                <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white font-black text-sm md:text-base px-6 py-2 rounded-full shadow-xl shadow-purple-500/30 border border-white/20 backdrop-blur-sm transform rotate-3 flex items-center gap-2 hover:-rotate-3 transition-transform duration-300">
                    <FaRocket className="text-yellow-300" /> 
                    Coming Soon!
                </div>
            </div>

            <div className="text-center max-w-2xl mb-10 mt-6">
                <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-700 w-16 h-16 rounded-2xl mb-4 border border-yellow-200">
                    <FaCoins className="text-3xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Top Up Your <span className="text-blue-600">Credits</span>
                </h2>
                <p className="text-slate-500 text-md leading-relaxed mb-6">
                    Interviewer.ai is currently in public beta. Enjoy your free signup credits while we prepare our premium payment gateways!
                </p>

                {userData && (
                    <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-6 py-3 my-5 rounded-full">
                        <span className="text-slate-600 font-medium">Current Balance:</span>
                        <span className="text-lg font-bold text-yellow-600 flex items-center gap-1.5">
                            <FaCoins /> {userData.credits || 0}
                        </span>
                    </div>
                )}
                
                <div className="flex justify-center mt-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
                    >
                        <FaArrowLeft /> Back
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-12">
                {pricingPlans.map((plan, index) => (
                    <div 
                        key={index} 
                        className={`relative bg-white rounded-3xl p-8 border ${plan.recommended ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-105 md:scale-110 z-10' : 'border-slate-200 shadow-sm'} flex flex-col`}
                    >
                        {plan.recommended && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-500 to-blue-700 text-white px-5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                <FaStar /> Most Popular
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-slate-100 flex items-center gap-3">
                            <FaCoins className="text-yellow-500 text-xl" />
                            <div>
                                <p className="font-bold text-slate-800">{plan.credits} Credits</p>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                                    <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            disabled
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors cursor-not-allowed ${
                                plan.recommended 
                                ? "bg-slate-200 text-slate-400 border border-slate-200" 
                                : "bg-slate-50 text-slate-400 border border-slate-200"
                            }`}
                        >
                            Coming Soon
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Pricing;