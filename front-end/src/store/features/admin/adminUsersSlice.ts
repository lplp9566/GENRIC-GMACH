import axios from "axios";
import { IUser, IUsers, Status } from "../../../components/NavBar/Users/UsersDto";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

axios.defaults.withCredentials = true;

 interface AdminUsersType{
    allUsers:IUser[] | null
    status:Status,
    error: string | null;

 }
 const initialState:AdminUsersType ={
    allUsers:null,
    status:"idle",
    error: null
 }
 const BASE_URL = import.meta.env.VITE_BASE_URL;
 export const getAllUsers = createAsyncThunk(
    'admin/getAllUsers',
    async()=>{
        const response = await axios.get(`${BASE_URL}/users`|| "http://localhost:3000/users");
        return response.data
    }
 )
     export const AdminUsersSlice = createSlice({
        name:'adminUsers',
        initialState,
        reducers:{},
        extraReducers:(builder)=>{
            builder
            .addCase(getAllUsers.pending,(state)=>{
                state.status = "pending",
                state.error = null,
                state.allUsers = null
            })
            .addCase(getAllUsers.fulfilled,(state,action)=>{
                state.status = "fulfilled",
                state.error = null,
                state.allUsers = action.payload
            })
            .addCase(getAllUsers.rejected,(state,action)=>{
                state.status = "rejected",
                state.error = action.error.message || null,
                state.allUsers = null
            })
        }
    })
    export default AdminUsersSlice.reducer