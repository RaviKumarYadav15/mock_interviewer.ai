import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        isAuthModalOpen: false 
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setAuthModalOpen: (state, action) => { 
            state.isAuthModalOpen = action.payload;
        }
    }
});

export const { setUserData, setAuthModalOpen } = userSlice.actions;
export default userSlice.reducer;