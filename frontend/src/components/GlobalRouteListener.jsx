import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetInterview } from '../redux/interviewSlice.js';

function GlobalRouteListener() {
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const isInterviewRoute = location.pathname.includes('/interview');
        if (!isInterviewRoute) {
            
            //  Wipe Session Storage
            sessionStorage.removeItem("interviewState");
            
            // 2 Reset Redux back to Step 1
            dispatch(resetInterview());
        }
        
    }, [location.pathname, dispatch]);
    return null;
}
export default GlobalRouteListener;