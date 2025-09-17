import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
    LoanModalMode: boolean
    MonthlyPaymentModalMode?: boolean
    AddDepositModal?: boolean
    AddDonationModal?: boolean
    withdrawDonationModal?: boolean
}

const initialState:AppModeType = {
    LoanModalMode:false,
    mode:'admin',
    MonthlyPaymentModalMode:false,
    AddDepositModal:false,
    AddDonationModal:false,
    withdrawDonationModal:false
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
            
            state.AddDepositModal = action.payload
        },
        setAddDonationModal(state, action) {
            
            state.AddDonationModal = action.payload
        },
        setWithdrawDonationModal(state, action) {
            
            state.withdrawDonationModal = action.payload
        },
        
    }
})
export const {setAppMode,setLoanModalMode,setMonthlyPaymentModalMode,setAddDepositModal,setAddDonationModal,setWithdrawDonationModal} = AppModeSlice.actions
export default AppModeSlice.reducer