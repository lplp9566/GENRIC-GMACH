import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../../components/NavBar/Users/UsersDto";
import axios from "axios";
import { ILoan, ILoanAction } from "../../../components/Loans/LoanDto";
import { FindLoansOpts, PaginatedResult } from "../../../common/indexTypes";

interface AdminLoanType {
  allLoans: ILoan[];
  loanActions: ILoanAction[];
  status: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  
}
const initialState: AdminLoanType = {
  allLoans: [],
  loanActions: [],
  error: null,
  status: "idle",
  pageCount: 1,
  page: 1,
  total: 0,
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllLoans = createAsyncThunk<
  PaginatedResult<ILoan>,
  FindLoansOpts
>("admin/getAllLoans", async (opts) => {
  const response = await axios.get<PaginatedResult<ILoan>>(`${BASE_URL}/loans`,
    {params: opts}
  );
  console.log(response);
  return response.data;
});
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
    }
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
      });
  },
});
export const { setPage } = AdminLoansSlice.actions;
export default AdminLoansSlice.reducer;
