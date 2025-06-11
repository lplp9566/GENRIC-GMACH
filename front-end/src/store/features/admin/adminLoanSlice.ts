import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../../components/Users/UsersDto";
import axios from "axios";
import {
  ICreateLoan,
  ICreateLoanAction,
  ILoanWithUser,
  ILoanAction,
  ILoanCheckResponse,
  ILoanWithPayment,
} from "../../../components/Loans/LoanDto";
import { FindLoansOpts, PaginatedResult } from "../../../common/indexTypes";

interface AdminLoanType {
  allLoans: ILoanWithUser[];
  loanActions: ILoanAction[];
  status: Status;
  checkLoanStatus: Status;
  createLoanStatus: Status;
  loanDeleteStatus: Status;
  createLoanActionStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  loanDetails: ILoanWithPayment | null;
  checkLoanResponse: ILoanCheckResponse;

}
const initialState: AdminLoanType = {
  allLoans: [],
  loanActions: [],
  error: null,
  status: "idle",
  checkLoanStatus: "idle",
  createLoanStatus: "idle",
  loanDeleteStatus: "idle",
  createLoanActionStatus: "idle",
  pageCount: 1,
  page: 1,
  total: 0,
  loanDetails: null,

  checkLoanResponse: {
    ok: false,
    error: "",
  },
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllLoans = createAsyncThunk<
  PaginatedResult<ILoanWithUser>,
  FindLoansOpts
>("admin/getAllLoans", async (opts) => {
  console.log("getAllLoans called with opts:", opts);

  const response = await axios.get<PaginatedResult<ILoanWithUser>>(
    `${BASE_URL}/loans`,
    { params: opts }
  );
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
    const response = await axios.post<ILoanWithUser>(`${BASE_URL}/loans`, loan);
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
export const getLoanDetails = createAsyncThunk(
  "admin/getLoanDetails",
  async (id: number) => {
    const response = await axios.get(
      `${BASE_URL}/loans/id`,
      { params: { id } } 
    );
    console.log(response.data)
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
    setCheckLoanStatus(state, action: PayloadAction<Status>) {
      state.checkLoanStatus = action.payload;
    },
    setLoanActionStatus(state, action: PayloadAction<Status>) {
      state.createLoanActionStatus = action.payload;
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
      })
      .addCase(getLoanDetails.pending, (state) => {
        state.loanDetails = null;
        state.loanDeleteStatus = "pending";
      })
      .addCase(getLoanDetails.fulfilled, (state, action) => {
        state.loanDetails = action.payload;
        state.loanDeleteStatus = "fulfilled";
      })
      .addCase(getLoanDetails.rejected, (state, action) => {
        state.loanDetails = null;
        state.loanDeleteStatus = "rejected";
        state.error = action.error.message || null;
      })
      .addCase(createLoanAction.pending, (state) => {
        state.createLoanActionStatus = "pending";
        state.error = null;
      })
      .addCase(createLoanAction.fulfilled, (state) => {
        state.createLoanActionStatus = "fulfilled";
        state.error = null;
      })
      .addCase(createLoanAction.rejected, (state, action) => {
        state.createLoanActionStatus = "rejected";
        state.error = action.error.message! ;
      });
  },
});
export const { setPage, setCheckLoanStatus ,setLoanActionStatus} = AdminLoansSlice.actions;
export default AdminLoansSlice.reducer;
