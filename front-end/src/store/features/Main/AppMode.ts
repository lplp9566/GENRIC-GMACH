import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
    LoanModalMode: boolean
    MonthlyPaymentModalMode?: boolean
    AddDepositModal?: boolean
    AddDonationModal?: boolean
}

const initialState:AppModeType = {
    LoanModalMode:false,
    mode:'admin',
    MonthlyPaymentModalMode:false,
    AddDepositModal:false,
    AddDonationModal:false
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
        },
        setAddDonationModal(state, action) {
            console.log("Setting AddDonationModal to", action.payload);
            
            state.AddDonationModal = action.payload
        },
        
    }
})
export const {setAppMode,setLoanModalMode,setMonthlyPaymentModalMode,setAddDepositModal,setAddDonationModal} = AppModeSlice.actions
export default AppModeSlice.reducer