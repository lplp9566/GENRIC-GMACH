import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { IMonthlyPayment, INewMonthlyPayment } from "../../../Admin/components/MonthlyPayments/MonthlyPaymentsDto";
import { Status } from "../../../Admin/components/Users/UsersDto";

interface AdminMonthlyPaymentsType {
  allPayments: IMonthlyPayment[] | [];
  GetPaymentsStatus: Status;
  AddMonthlyPaymentStatus: Status;
  error: string | null;
  updateMonthlyPaymentStatus: Status
}
const initialState: AdminMonthlyPaymentsType = {
  allPayments: [],
  error: null,
  GetPaymentsStatus: "idle",
    AddMonthlyPaymentStatus: "idle",
    updateMonthlyPaymentStatus: "idle",
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
export const updateMonthlyPayment = createAsyncThunk(
  "/admin/updateMonthlyPayment",
  async (monthlyPayment: IMonthlyPayment) => {
    const response = await axios.patch<IMonthlyPayment>(
      `${BASE_URL}/monthly-deposits/${monthlyPayment.id}`,
      monthlyPayment
    );
    return response.data;
  }
)
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
export const deleteMonthlyPayment = createAsyncThunk(
  "/admin/deleteMonthlyPayment",
  async (id: number) => {
  await axios.delete(`${BASE_URL}/monthly-deposits/${id}`);
    return id; 
  }
)
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
        })
        .addCase(updateMonthlyPayment.pending, (state) => {
            state.updateMonthlyPaymentStatus = "pending";
        })
        .addCase(updateMonthlyPayment.fulfilled, (state,action) => {
            const update = action.payload
            const index = state.allPayments.findIndex((payment) => payment.id === update.id);
            if (index !== -1) {
                state.allPayments[index] = update;
            }
            state.updateMonthlyPaymentStatus = "fulfilled";
           
        })
        .addCase(updateMonthlyPayment.rejected, (state, action) => {
            state.updateMonthlyPaymentStatus = "rejected";
            state.error = action.error.message || null;
        })
        .addCase(deleteMonthlyPayment.pending, (state) => {
            state.updateMonthlyPaymentStatus = "pending";
        })
        .addCase(deleteMonthlyPayment.fulfilled, (state,action) => {
            const id = action.payload
            state.allPayments = state.allPayments.filter((payment) => payment.id !== id); 
            state.updateMonthlyPaymentStatus = "fulfilled";
           
        })
        .addCase(deleteMonthlyPayment.rejected, (state, action) => {
            state.updateMonthlyPaymentStatus = "rejected";
            state.error = action.error.message || null;
        });
  },
});
export default AdminMonthlyPaymentsSlice.reducer;
