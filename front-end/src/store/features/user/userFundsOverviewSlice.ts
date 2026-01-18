import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IUserFundsOverviewByYear } from "../../../Admin/components/FundsOverview/FundsOverviewDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { api } from "../../axiosInstance";

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

export const getUserFundsOverview = createAsyncThunk(
  "/user/getUserFundsOverview",
  async (userId: number) => {
    const response = await api.get(
      `/user-financial-by-year/by-user/?id=${userId}`
    );
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
