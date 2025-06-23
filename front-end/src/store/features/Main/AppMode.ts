import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
    LoanModalMode: boolean
    MonthlyPaymentModalMode?: boolean
}

const initialState:AppModeType = {
    LoanModalMode:false,
    mode:'admin',
    MonthlyPaymentModalMode:false
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
        },
        setMonthlyPaymentModalMode(state, action) {
            state.MonthlyPaymentModalMode = action.payload
        }
    }
})
export const {setAppMode,setLoanModalMode,setMonthlyPaymentModalMode} = AppModeSlice.actions
export default AppModeSlice.reducer