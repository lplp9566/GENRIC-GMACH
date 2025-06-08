import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IUserFundsOverviewByYear } from "../../../components/FundsOverview/FundsOverviewDto";
import { Status } from "../../../components/Users/UsersDto";
import axios from "axios";

interface UserFundsOverviewType {
    fundsOverview: IUserFundsOverviewByYear | [];
    status: Status;
    error: string | null;
}

const initialSlice: UserFundsOverviewType = {
    fundsOverview: [],
    status: "idle",
    error: null,
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getUserFundsOverview = createAsyncThunk(
    "/user/getUserFundsOverview",
    async (userId: number) => {
        const response = await axios.get(
            `${BASE_URL}/user-financial-by-year/by-user/?id=${userId}`
        );
        console.log(response.data)
        return response.data;
    }
);
export const UserFundsOverviewSlice = createSlice({
    name: "userFundsOverview",
    initialState: initialSlice,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUserFundsOverview.pending, (state) => {
                state.status = "pending";
            })
            .addCase(getUserFundsOverview.fulfilled, (state, action) => {
                state.status = "fulfilled";
                state.fundsOverview = action.payload;
            })
            .addCase(getUserFundsOverview.rejected, (state, action) => {
                state.status = "rejected";
                state.error = action.error.message || null;
            });
    },
});

export default UserFundsOverviewSlice.reducer;