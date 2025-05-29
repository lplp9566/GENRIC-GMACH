import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../../components/NavBar/Users/UsersDto";
import axios from "axios";
import {
  ICreateLoan,
  ILoan,
  ILoanAction,
  ILoanCheckResponse,
} from "../../../components/Loans/LoanDto";
import { FindLoansOpts, PaginatedResult } from "../../../common/indexTypes";

interface AdminLoanType {
  allLoans: ILoan[];
  loanActions: ILoanAction[];
  status: Status;
  checkLoanStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  checkLoan: ILoanCheckResponse;
}
const initialState: AdminLoanType = {
  allLoans: [],
  loanActions: [],
  error: null,
  status: "idle",
  checkLoanStatus: "idle",
  pageCount: 1,
  page: 1,
  total: 0,
  checkLoan: {
    ok: false,
    error: "",
  },
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllLoans = createAsyncThunk<
  PaginatedResult<ILoan>,
  FindLoansOpts
>("admin/getAllLoans", async (opts) => {
    console.log("getAllLoans called with opts:", opts);
    
  const response = await axios.get<PaginatedResult<ILoan>>(
    `${BASE_URL}/loans`,
    { params: opts }
  );
  console.log(response);
  return response.data;
});
export const checkLoan = createAsyncThunk(
  "admin/checkLoan",
  async (loan: ICreateLoan) => {
    const response = await axios.post<ILoanCheckResponse>(
      `${BASE_URL}/loans/check-loan`,
      loan
    );
    console.log(response);
    return response.data;
  }
);
export const getAllLoanActions = createAsyncThunk(
  "admin/getAllLoanActions",
  async () => {
    const response = await axios.get(`${BASE_URL}/loan-actions`);
    console.log(response);
    return response.data;
  }
);
export const AdminLoansSlice = createSlice({
  name: "adminLoans",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLoans.pending, (state) => {
        (state.status = "pending"), (state.allLoans = []), (state.error = null);
      })
      .addCase(getAllLoans.fulfilled, (state, action) => {
        (state.allLoans = action.payload.data),
          (state.page = action.payload.page),
          (state.pageCount = action.payload.pageCount),
          (state.total = action.payload.total),
          console.log("all loans", action.payload.data);
        (state.status = "fulfilled"), (state.error = null);
      })
      .addCase(getAllLoans.rejected, (state, action) => {
        (state.allLoans = []),
          (state.error = action.error.message || null),
          (state.status = "rejected");
      })
      .addCase(getAllLoanActions.pending, (state) => {
        (state.status = "pending"),
          (state.loanActions = []),
          (state.error = null);
      })
      .addCase(getAllLoanActions.fulfilled, (state, action) => {
        state.loanActions = action.payload;
        (state.status = "fulfilled"), (state.error = null);
      })
      .addCase(getAllLoanActions.rejected, (state, action) => {
        (state.loanActions = []),
          (state.error = action.error.message || null),
          (state.status = "rejected");
      })
      .addCase(checkLoan.pending, (state) => {
        state.checkLoanStatus = "pending";
        state.checkLoan = { ok: false, error: "" };
      })
      .addCase(checkLoan.fulfilled, (state, action) => {
        state.checkLoan = action.payload;
        state.checkLoanStatus = "fulfilled";
      })
        .addCase(checkLoan.rejected, (state, action) => {
            state.checkLoanStatus = "rejected";
            state.checkLoan = { ok: false, error: action.error.message || "" };
        });
  },
});
export const { setPage } = AdminLoansSlice.actions;
export default AdminLoansSlice.reducer;
