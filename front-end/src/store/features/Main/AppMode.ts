import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
    LoanModalMode: boolean
    MonthlyPaymentModalMode?: boolean
    AddDepositModal?: boolean
}

const initialState:AppModeType = {
    LoanModalMode:false,
    mode:'admin',
    MonthlyPaymentModalMode:false,
    AddDepositModal:false
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
        },
        setAddDepositModal(state, action) {
            console.log("Setting AddDepositModal to", action.payload);
            
            state.AddDepositModal = action.payload
        }
    }
})
export const {setAppMode,setLoanModalMode,setMonthlyPaymentModalMode,setAddDepositModal} = AppModeSlice.actions
export default AppModeSlice.reducer