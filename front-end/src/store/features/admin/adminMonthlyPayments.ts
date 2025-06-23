import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IMonthlyPayment } from "../../../components/MonthlyPayments/MunthlyPaymentsDto";
import { Status } from "../../../components/Users/UsersDto";
import axios from "axios";

interface AdminMonthlyPaymentsType {
    allPayments :IMonthlyPayment[]|[]
    GetPaymentsStatus: Status
    error: string |null
}
const initialState:AdminMonthlyPaymentsType={
allPayments:[],
error:null,
GetPaymentsStatus:"idle"
}
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const gatAllMonthlyPayments = createAsyncThunk
(
    '/admin/getAllMonthlyPayments',
    async()=>{
        const response = await axios.get(`${BASE_URL}/monthly-deposits`);
        return response.data
    }
);
export const AdminMonthlyPaymentsSlice = createSlice({
    name:"adminMonthlyPayments",
    initialState,
    reducers:{},    
    extraReducers:(builder)=>{
        builder
        .addCase(gatAllMonthlyPayments.pending, (state) => {
            state.GetPaymentsStatus = "pending";
        })
        .addCase(gatAllMonthlyPayments.fulfilled, (state, action) => {
            state.GetPaymentsStatus = "fulfilled";
            state.allPayments = action.payload;
        })
        .addCase(gatAllMonthlyPayments.rejected, (state, action) => {
            state.GetPaymentsStatus = "rejected";
            state.error = action.error.message || null;
        });
    }
})
export default AdminMonthlyPaymentsSlice.reducer