import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;
interface AppModeType {
    mode : 'admin' | 'user'
}

const initialState:AppModeType = {
    mode:'admin'
}
export const AppModeSlice = createSlice({
    name:'AppMode',
    initialState,
    reducers:{
        setAppMode(state,action){
            state.mode = action.payload
        }
    }
})
export const {setAppMode} = AppModeSlice.actions
export default AppModeSlice.reducer