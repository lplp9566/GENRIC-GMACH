import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Status } from "../../../Admin/components/Users/UsersDto";

export interface BankCurrentDto {
  id: number;
  bank_name: string;
  date: string;
  amount: number;
}

export interface CreateBankCurrentDto {
  bank_name: string;
  date: string;
  amount: number;
}

export interface UpdateBankCurrentDto {
  bank_name?: string;
  date?: string;
  amount?: number;
}

interface AdminBankCurrentState {
  items: BankCurrentDto[];
  status: Status;
  error: string | null;
}

const initialState: AdminBankCurrentState = {
  items: [],
  status: "idle",
  error: null,
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getBankCurrent = createAsyncThunk(
  "/admin/getBankCurrent",
  async () => {
    const response = await axios.get(`${BASE_URL}/bank-current`);
    return response.data as BankCurrentDto[];
  }
);

export const createBankCurrent = createAsyncThunk(
  "/admin/createBankCurrent",
  async (payload: CreateBankCurrentDto) => {
    const response = await axios.post(`${BASE_URL}/bank-current`, payload);
    return response.data as BankCurrentDto;
  }
);

export const updateBankCurrent = createAsyncThunk(
  "/admin/updateBankCurrent",
  async (payload: { id: number; data: UpdateBankCurrentDto }) => {
    const response = await axios.patch(
      `${BASE_URL}/bank-current/${payload.id}`,
      payload.data
    );
    return response.data;
  }
);

export const deleteBankCurrent = createAsyncThunk(
  "/admin/deleteBankCurrent",
  async (id: number) => {
    const response = await axios.delete(`${BASE_URL}/bank-current/${id}`);
    return response.data;
  }
);

export const AdminBankCurrentSlice = createSlice({
  name: "adminBankCurrent",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBankCurrent.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getBankCurrent.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = action.payload ?? [];
      })
      .addCase(getBankCurrent.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || null;
      });
  },
});

export default AdminBankCurrentSlice.reducer;
