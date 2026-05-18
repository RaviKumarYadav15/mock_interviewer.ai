import { createSlice } from "@reduxjs/toolkit";

const loadState = () => {
    try {
        const serializedState = sessionStorage.getItem("interviewState");
        if (serializedState === null) {
            return { step: 1, interviewData: null, reportData: null };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return { step: 1, interviewData: null, reportData: null };
    }
};
const interviewSlice = createSlice({
    name: "interview",
    initialState: loadState(), 
    reducers: {
        setStep: (state, action) => {
            state.step = action.payload;
            sessionStorage.setItem("interviewState", JSON.stringify(state));
        },
        setInterviewData: (state, action) => {
            state.interviewData = action.payload;
            sessionStorage.setItem("interviewState", JSON.stringify(state));
        },
        setReportData: (state, action) => {
            state.reportData = action.payload;
            sessionStorage.setItem("interviewState", JSON.stringify(state));
        },
        resetInterview: (state) => {
            state.step = 1;
            state.interviewData = null;
            state.reportData = null;
            sessionStorage.removeItem("interviewState");
        }
    }
});

export const { setStep, setInterviewData, setReportData, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;