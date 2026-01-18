import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  FindOptionsGeneric,
  PaginatedResult,
  StatusGeneric,
} from "../../../common/indexTypes";
import {
  ICreateLoan,
  ICreateLoanAction,
  IEditLoan,
  ILoanAction,
  ILoanCheckResponse,
  ILoanWithPayment,
  ILoanWithUser,
} from "../../../Admin/components/Loans/LoanDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { api } from "../../axiosInstance";

interface AdminLoanType {
  allLoans: ILoanWithUser[];
  loanActions: ILoanAction[];
  status: Status;
  checkLoanStatus: Status;
  createLoanStatus: Status;
  loanDeleteStatus: Status;
  createLoanActionStatus: Status;
  editLoanStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  loanDetails: ILoanWithPayment | null;
  checkLoanResponse: ILoanCheckResponse;
  editLoanActionStatus: Status;
  deleteLoanStatus: Status;
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
  editLoanActionStatus: "idle",
  deleteLoanStatus: "idle",
  pageCount: 1,
  page: 1,
  total: 0,
  loanDetails: null,
  editLoanStatus: "idle",
  checkLoanResponse: {
    ok: false,
    error: "",
    butten: false,
  },
};
export const getAllLoans = createAsyncThunk<
  PaginatedResult<ILoanWithUser>,
  FindOptionsGeneric
>("admin/getAllLoans", async (opts) => {
  const response = await api.get<PaginatedResult<ILoanWithUser>>(
    `/loans`,
    { params: opts }
  );
  return response.data;
});
export const checkLoan = createAsyncThunk(
  "admin/checkLoan",
  async (loan: ICreateLoan) => {
    const response = await api.post<ILoanCheckResponse>(
      `/loans/check-loan`,
      loan
    );
    return response.data;
  }
);
export const createLoan = createAsyncThunk(
  "admin/createLoan",
  async (loan: ICreateLoan) => {
    const response = await api.post<ILoanWithUser>(`/loans`, loan);
    return response.data;
  }
);
export const createLoanAction = createAsyncThunk(
  "admin/createLoanAction",
  async (loanAction: ICreateLoanAction) => {
    console.log(loanAction);
    const response = await api.post<ICreateLoanAction>(
      `/loan-actions`,
      loanAction
    );
    return response.data;
  }
);
export const getAllLoanActions = createAsyncThunk(
  "admin/getAllLoanActions",
  async () => {
    const response = await api.get(`/loan-actions`);
    return response.data;
  }
);
export const getLoanDetails = createAsyncThunk(
  "admin/getLoanDetails",
  async (id: number) => {
    const response = await api.get(`/loans/id`, {
      params: { id },
    });
    return response.data;
  }
);
export const editLoan = createAsyncThunk(
  "admin/editLoan",
  async (loan: IEditLoan) => {
    const response = await api.patch(`/loans/${loan.loan}`, loan);
    // if (response.status === 200){ await thunkAPI.dispatch (getAllLoans({page:1,limit:20}));}
    return response.data;
  }
);
export const editLoanAction = createAsyncThunk(
  "admin/editLoanAction",
  async (
    loanAction: { id: number; loanId: number; date?: Date; value?: number },
    thunkAPI
  ) => {
    const response = await api.patch(
      `/loan-actions/${loanAction.id}`,
      loanAction
    );
    await thunkAPI.dispatch(getLoanDetails(loanAction.loanId));
    return response.data;
  }
);
interface deleteLoanAction {
  id: number;
  loanId: number;
}
export const deleteLoanAction = createAsyncThunk(
  "admin/deleteLoanAction",
  async (deleteLoanAction: deleteLoanAction, thunkAPI) => {
    const response = await api.delete(`/loan-actions/${deleteLoanAction.id}`);
    await thunkAPI.dispatch(getLoanDetails(deleteLoanAction.loanId));
    return response.data;
  }
);
export const deleteLoan = createAsyncThunk(
  "admin/deleteLoan",
  async (id: number, thunkAPI) => {
    console.log(id);

    const response = await api.delete(`/loans/${id}`);
    await thunkAPI.dispatch(
      getAllLoans({ page: 1, limit: 20, status: StatusGeneric.ACTIVE })
    );
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
          (state.status = "fulfilled"),
          (state.error = null);
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
        state.checkLoanResponse = { ok: false, error: "", butten: false };
      })
      .addCase(checkLoan.fulfilled, (state, action) => {
        state.checkLoanResponse = action.payload;
        state.checkLoanStatus = "fulfilled";
      })
      .addCase(checkLoan.rejected, (state, action) => {
        state.checkLoanStatus = "rejected";
        state.checkLoanResponse = {
          ok: false,
          error: action.error.message || "",
          butten: false,
        };
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
        state.error = action.error.message!;
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
        state.error = action.error.message!;
      })
      .addCase(editLoan.pending, (state) => {
        state.editLoanStatus = "pending";
        state.error = null;
      })
      .addCase(editLoan.fulfilled, (state, action) => {
        state.editLoanStatus = "fulfilled";
        state.loanDetails = action.payload;
        state.error = null;
      })
      .addCase(editLoan.rejected, (state, action) => {
        state.editLoanStatus = "rejected";
        state.error = action.error.message ?? null;
      })
      .addCase(editLoanAction.pending, (state) => {
        state.editLoanActionStatus = "pending";
        state.error = null;
      })
      .addCase(editLoanAction.fulfilled, (state, { payload }) => {
        state.editLoanActionStatus = "fulfilled";

        const idx = state.loanDetails?.actions?.findIndex(
          (x) => Number(x.id) === Number(payload.id)
        );

        if (idx !== undefined && idx !== -1 && state.loanDetails?.actions) {
          state.loanDetails.actions[idx] = payload;
        }
        state.error = null;
      })
      .addCase(editLoanAction.rejected, (state, action) => {
        state.editLoanActionStatus = "rejected";
        state.error = action.error.message ?? null;
      })
      .addCase(deleteLoan.pending, (state) => {
        state.deleteLoanStatus = "pending";
        state.error = null;
      })
      .addCase(deleteLoan.fulfilled, (state) => {
        state.deleteLoanStatus = "fulfilled";
        state.error = null;
      })
      .addCase(deleteLoan.rejected, (state, action) => {
        state.deleteLoanStatus = "rejected";
        state.error = action.error.message ?? null;
      })
      .addCase(deleteLoanAction.pending, (state) => {
        state.editLoanActionStatus = "pending";
        state.error = null;
      })
      .addCase(deleteLoanAction.fulfilled, (state, { payload }) => {
        state.editLoanActionStatus = "fulfilled";
        state.loanActions = state.loanActions.filter((x => Number(x.id) !== Number(payload.id)))
        state.error = null;
      })
      .addCase(deleteLoanAction.rejected, (state, action) => {
        state.editLoanActionStatus = "rejected";
        state.error = action.error.message ?? null;
      });
  },
});
export const { setPage, setCheckLoanStatus, setLoanActionStatus } =
  AdminLoansSlice.actions;
export default AdminLoansSlice.reducer;
