import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

import axios from "axios"
import { IFundsOverview, IFundsOverviewByYear } from "../../../Admin/components/FundsOverview/FundsOverviewDto"
import { Status } from "../../../Admin/components/Users/UsersDto"
export interface IRegulation{
    id?: number,
    regulation: string
    
}
interface AdminFundsOverviewType {
    fundsOverview: IFundsOverview | null
    fundsOverviewByYear: IFundsOverviewByYear [] | null
    status: Status
    error: string | null
    regulation: IRegulation[] | null
    regulationStatus: Status
}

const initialSlice:AdminFundsOverviewType={
    fundsOverview:null,
    fundsOverviewByYear:null,
    status:"idle",
    error: null,
    regulation: null,
    regulationStatus:"idle"
}

const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getFundsOverview = createAsyncThunk(
    '/admin/getFundsOverview',
    async()=>{
        const response = await axios.get(`${BASE_URL}/funds-overview`);
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
export const getRegulation = createAsyncThunk(
    '/admin/getRegulation',
    async()=>{
        const response = await axios.get(`${BASE_URL}/regulation`);
        return response.data
    }
)
export const UpdateRegulation = createAsyncThunk(
    '/admin/updateRegulation',
    async(regulation:IRegulation)=>{
        const response = await axios.post(`${BASE_URL}/regulation`,regulation);
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
        .addCase(getRegulation.pending,(state)=>{
            state.regulationStatus = "pending"
            state.error = null
            state.regulation = null
        })
        .addCase(getRegulation.fulfilled,(state,action)=>{
            state.regulationStatus = "fulfilled"
            state.regulation = action.payload
        })
        .addCase(getRegulation.rejected,(state,action)=>{
            state.regulationStatus = "rejected"
            state.error = action.error.message || null
        })
    }
 })
 export default AdminFundsOverviewSlice.reducer