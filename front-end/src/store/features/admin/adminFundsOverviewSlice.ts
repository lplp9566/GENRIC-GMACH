import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { IFundsOverview, IFundsOverviewByYear } from "../../../components/FundsOverview/FundsOverviewDto"
import { Status } from "../../../components/Users/UsersDto"
import axios from "axios"

interface AdminFundsOverviewType {
    fundsOverview: IFundsOverview | null
    fundsOverviewByYear: IFundsOverviewByYear [] | null
    status: Status
    error: string | null
}

const initialSlice:AdminFundsOverviewType={
    fundsOverview:null,
    fundsOverviewByYear:null,
    status:"idle",
    error: null
}

const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getFundsOverview = createAsyncThunk(
    '/admin/getFundsOverview',
    async()=>{
        const response = await axios.get(`${BASE_URL}/funds-overview`|| "http://localhost:3000/funds-overview");
        return response.data
    }
 )
export const getFundsOverviewByYear = createAsyncThunk(
    '/admin/getFundsOverviewByYear',
    async()=>{
        const response = await axios.get(`${BASE_URL}/funds-overview-by-year`|| "http://localhost:3000/funds-overview-by-year");
        return response.data
    }
)
 export const AdminFundsOverviewSlice = createSlice({
    name:'adminFundsOverview',
    initialState:initialSlice,
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(getFundsOverview.pending,(state)=>{
            state.status = "pending"
        })
        .addCase(getFundsOverview.fulfilled,(state,action)=>{
            state.status = "fulfilled"
            state.fundsOverview = action.payload
        })
        .addCase(getFundsOverview.rejected,(state,action)=>{
            state.status = "rejected"
            state.error = action.error.message || null
        })
        .addCase(getFundsOverviewByYear.pending,(state)=>{
            state.status = "pending"
        })
        .addCase(getFundsOverviewByYear.fulfilled,(state,action)=>{
            state.status = "fulfilled"
            state.fundsOverviewByYear = action.payload
        })
        .addCase(getFundsOverviewByYear.rejected,(state,action)=>{
            state.status = "rejected"
            state.error = action.error.message || null
        })
    }
 })
 export default AdminFundsOverviewSlice.reducer