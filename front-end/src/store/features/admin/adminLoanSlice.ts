import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../../components/Users/UsersDto";
import axios from "axios";
import {
  ICreateLoan,
  ICreateLoanAction,
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
  createLoanStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  checkLoanResponse: ILoanCheckResponse;
}
const initialState: AdminLoanType = {
  allLoans: [],
  loanActions: [],
  error: null,
  status: "idle",
  checkLoanStatus: "idle",
  createLoanStatus: "idle",
  pageCount: 1,
  page: 1,
  total: 0,
  checkLoanResponse: {
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
export const createLoan = createAsyncThunk(
  "admin/createLoan",
  async (loan: ICreateLoan) => {
    const response = await axios.post<ILoan>(`${BASE_URL}/loans`, loan);
    console.log(response);
    return response.data;
  }
);
export const createLoanAction = createAsyncThunk(
  "admin/createLoanAction",
  async (loanAction:ICreateLoanAction ) => {
    const response = await axios.post<ICreateLoanAction>(
      `${BASE_URL}/loan-actions`,
      loanAction
    );
    console.log(response);
    return response.data;
  }
)
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
        state.checkLoanResponse = { ok: false, error: "" };
      })
      .addCase(checkLoan.fulfilled, (state, action) => {
        state.checkLoanResponse = action.payload;
        state.checkLoanStatus = "fulfilled";
      })
      .addCase(checkLoan.rejected, (state, action) => {
        state.checkLoanStatus = "rejected";
        state.checkLoanResponse = { ok: false, error: action.error.message || "" };
      })
      .addCase(createLoan.pending, (state) => {
        state.createLoanStatus = "pending";
        state.error = null;
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.allLoans.push(action.payload);
        state.createLoanStatus = "fulfilled";
        state.error = null;
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.createLoanStatus = "rejected";
        state.error = action.error.message! ;
      });
  },
});
export const { setPage } = AdminLoansSlice.actions;
export default AdminLoansSlice.reducer;
