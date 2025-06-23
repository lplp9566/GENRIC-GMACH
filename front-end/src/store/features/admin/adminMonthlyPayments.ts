import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IMonthlyPayment, INewMonthlyPayment } from "../../../components/MonthlyPayments/MunthlyPaymentsDto";
import { Status } from "../../../components/Users/UsersDto";
import axios from "axios";

interface AdminMonthlyPaymentsType {
  allPayments: IMonthlyPayment[] | [];
  GetPaymentsStatus: Status;
  AddMonthlyPaymentStatus?: Status;
  error: string | null;
}
const initialState: AdminMonthlyPaymentsType = {
  allPayments: [],
  error: null,
  GetPaymentsStatus: "idle",
    AddMonthlyPaymentStatus: "idle",
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const gatAllMonthlyPayments = createAsyncThunk(
  "/admin/getAllMonthlyPayments",
  async () => {
    const response = await axios.get(`${BASE_URL}/monthly-deposits`);
    return response.data;
  }
);
export const getMonthlyPaymentsByUserId = createAsyncThunk(
  "/admin/getMonthlyPaymentsByUserId",
  async (userId: number) => {
    const response = await axios.get<IMonthlyPayment[]>(
      `${BASE_URL}/monthly-deposits/user`,
      {
        params: { userId },
      }
    );
    return response.data;
  }
);
export const createMonthlyPayment = createAsyncThunk(
  "/admin/createMonthlyPayment",
  async (monthlyPayment: INewMonthlyPayment) => {
    const response = await axios.post<INewMonthlyPayment>(
      `${BASE_URL}/monthly-deposits`,
      monthlyPayment
    );
    return response.data;       
  }
);
export const AdminMonthlyPaymentsSlice = createSlice({
  name: "adminMonthlyPayments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
      })
      .addCase(getMonthlyPaymentsByUserId.pending, (state) => {
        state.GetPaymentsStatus = "pending";
      })
      .addCase(getMonthlyPaymentsByUserId.fulfilled, (state, action) => {
        state.GetPaymentsStatus = "fulfilled";
        state.allPayments = action.payload;
      })
      .addCase(getMonthlyPaymentsByUserId.rejected, (state, action) => {
        state.GetPaymentsStatus = "rejected";
        state.error = action.error.message || null;
      })
        .addCase(createMonthlyPayment.pending, (state) => {
            state.AddMonthlyPaymentStatus = "pending";
        })
        .addCase(createMonthlyPayment.fulfilled, (state) => {
            state.AddMonthlyPaymentStatus = "fulfilled";
           
        })
        .addCase(createMonthlyPayment.rejected, (state, action) => {
            state.AddMonthlyPaymentStatus = "rejected";
            state.error = action.error.message || null;
        });
  },
});
export default AdminMonthlyPaymentsSlice.reducer;
