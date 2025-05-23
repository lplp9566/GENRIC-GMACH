import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Status } from "../../../components/NavBar/Users/UsersDto";
import axios from "axios";
import { ILoan } from "../../../components/Loans/LoaDto";

interface AdminLoanType {
    allLoans:ILoan[] |null
        status:Status,
        error: string | null;
}
const initialState:AdminLoanType = {
    allLoans:null ,
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
 export const AdminLoansSlice =createSlice({
    name:'adminLoans',
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder 
        .addCase(getAllLoans.pending,(state)=>{
            state.status ='pending',
            state.allLoans = null,
            state.error = null
        })
        .addCase(getAllLoans.fulfilled,(state,action)=>{
            state.allLoans = action.payload
            state.status ='fulfilled' ,
            state.error = null
        })
        .addCase(getAllLoans.rejected,(state,action)=>{
            state.allLoans = null,
            state.error = action.error.message || null,
            state.status = 'rejected'
        })
    }
 }) 
 export default AdminLoansSlice.reducer