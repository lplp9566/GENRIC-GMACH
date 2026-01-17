import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Status } from "../../../Admin/components/Users/UsersDto";

export interface UserFinancials {
  id: number;
  userId: number;
  total_donations: number;
  total_monthly_deposits: number;
  total_equity_donations: number;
  total_cash_holdings: number;
  total_special_fund_donations: number;
  total_loans_taken: number;
  total_loans_taken_amount: number;
  total_loans_repaid: number;
  total_fixed_deposits_deposited: number;
  total_fixed_deposits_withdrawn: number;
  total_standing_order_return: number;
}

interface UserFinancialState {
  data: UserFinancials | null;
  status: Status;
  error: string | null;
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

const initialState: UserFinancialState = {
  data: null,
  status: "idle",
  error: null,
};

export const getUserFinancialsByUserGuard = createAsyncThunk<UserFinancials>(
  "userFinancials/getByUserGuard",
  async () => {
    const { data } = await axios.get<UserFinancials>(
      `${BASE_URL}/user-financial/by-user-guard`
    );
    return data;
  }
);

export const getUserFinancialsByUserId = createAsyncThunk<
  UserFinancials,
  number
>("userFinancials/getByUserId", async (userId) => {
  const { data } = await axios.get<UserFinancials>(
    `${BASE_URL}/user-financial/by-user?id=${userId}`
  );
  return data;
});

export const UserFinancialSlice = createSlice({
  name: "userFinancials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserFinancialsByUserGuard.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getUserFinancialsByUserGuard.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data = action.payload;
      })
      .addCase(getUserFinancialsByUserGuard.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message ?? "Failed to fetch user financials";
      })
      .addCase(getUserFinancialsByUserId.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getUserFinancialsByUserId.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data = action.payload;
      })
      .addCase(getUserFinancialsByUserId.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message ?? "Failed to fetch user financials";
      });
  },
});

export default UserFinancialSlice.reducer;
