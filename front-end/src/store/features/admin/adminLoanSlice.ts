import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Status } from "../../../components/NavBar/Users/UsersDto";
import axios from "axios";
import { ILoan, ILoanAction } from "../../../components/Loans/LoanDto";

interface AdminLoanType {
    allLoans:ILoan[] 
    loanActions:ILoanAction[],
        status:Status,
        error: string | null;
}
const initialState:AdminLoanType = {
    allLoans:[] ,
    loanActions:[],
    error :null ,
    status :'idle'
}
 const BASE_URL = import.meta.env.VITE_BASE_URL;

 export const getAllLoans = createAsyncThunk(
    'admin/getAllLoans',
    async()=>{
        const response = await axios.get(`${BASE_URL}/loans`)
        console.log(response)
        return response.data
    }
 )
 export const getAllLoanActions = createAsyncThunk(
    'admin/getAllLoanActions',
    async()=>{
        const response = await axios.get(`${BASE_URL}/loan-actions`)
        console.log(response)
        return response.data
    }
)
 export const AdminLoansSlice =createSlice({
    name:'adminLoans',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder 
        .addCase(getAllLoans.pending,(state)=>{
            state.status ='pending',
            state.allLoans = [],
            state.error = null
        })
        .addCase(getAllLoans.fulfilled,(state,action)=>{
            state.allLoans = action.payload
            state.status ='fulfilled' ,
            state.error = null
        })
        .addCase(getAllLoans.rejected,(state,action)=>{
            state.allLoans = [],
            state.error = action.error.message || null,
            state.status = 'rejected'
        })
        .addCase(getAllLoanActions.pending,(state)=>{
            state.status ='pending',
            state.loanActions = [],
            state.error = null
        })
        .addCase(getAllLoanActions.fulfilled,(state,action)=>{
            state.loanActions = action.payload
            state.status ='fulfilled' ,
            state.error = null
        })
        .addCase(getAllLoanActions.rejected,(state,action)=>{
            state.loanActions = [],
            state.error = action.error.message || null,
            state.status = 'rejected'   
        })
    }
 }) 
 export default AdminLoansSlice.reducer