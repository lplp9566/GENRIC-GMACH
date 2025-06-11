import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
    LoanModalMode: boolean
}

const initialState:AppModeType = {
    LoanModalMode:false,
    mode:'admin'
}
export const AppModeSlice = createSlice({
    name:'AppMode',
    initialState,
    reducers:{
        setAppMode(state,action){
            state.mode = action.payload
        },
        setLoanModalMode(state,action){
            state.LoanModalMode = action.payload
        }
    }
})
export const {setAppMode,setLoanModalMode} = AppModeSlice.actions
export default AppModeSlice.reducer