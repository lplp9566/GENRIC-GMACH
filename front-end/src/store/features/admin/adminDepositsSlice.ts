import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  ICreateDeposits,
  IDeposit,
  IDepositAction,
  IDepositActionCreate,
} from "../../../Admin/components/Deposits/depositsDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { FindOptionsGeneric, PaginatedResult } from "../../../common/indexTypes";
import { AppDispatch } from "../../store";
import { api } from "../../axiosInstance";

interface AdminDepositType {
  allDeposits: IDeposit[];
  currentDeposit: IDeposit | null;
  depositActions: IDepositAction[];
  allDepositsStatus: Status;
  depositCheckStatus: Status; 
  depositCheck:{
    ok: boolean;
    error?: string;
  }
  createDepositStatus: Status;
  depositActionsStatus: Status;
  createDepositActionStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
}

const initialState: AdminDepositType = {
  allDeposits: [],
  currentDeposit: null,
  depositActions: [],
  depositCheckStatus: "idle",
  allDepositsStatus: "idle",
  createDepositStatus: "idle",
  depositActionsStatus: "idle",
  createDepositActionStatus: "idle",
  depositCheck: {
    ok: false,
    error: undefined,
  },
  error: null,
  pageCount: 1,
  page: 1,
  total: 0,
};


export const getAllDeposits = createAsyncThunk<
  PaginatedResult<IDeposit>,
  FindOptionsGeneric
>("admin/getAllDeposits", async (opts) => {
  const { data } = await api.get<PaginatedResult<IDeposit>>(
    `/deposits`,
    { params: opts }
  );
  return data;
});

export const getDepositActions = createAsyncThunk<IDepositAction[], number>(
  "admin/getDepositActions",
  async (depositId) => {
    console.log(depositId, "getDepositActions");
    const { data } = await api.get<IDepositAction[]>(
      `/deposits-actions/${depositId}`
    );
    return data;
  }
);

export const getDepositDetails = createAsyncThunk<IDeposit, number>(
  "admin/getDepositDetails",
  async (depositId) => {
    const { data } = await api.get<IDeposit>(`/deposits/${depositId}`);
    console.log("Deposit details fetched:", data);
    
    return data;
  }
);

export const createDeposit = createAsyncThunk(
  "admin/createDeposit",
  async (deposit: ICreateDeposits) => {
    const { data } = await api.post<IDeposit>(`/deposits`, deposit);
    return data;
  }
);

export const bringForwardCheck = createAsyncThunk(
  "admin/bringForwardCheck",
  async (dto: { depositId: number; newReturnDate: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ ok: boolean; error?: string }>(
        `/deposits/${dto.depositId}/bring-forward/check`,
        { newReturnDate: dto.newReturnDate }
      );
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data ?? err?.message ?? "Request failed");
    }
  }
);


export const createDepositAction = createAsyncThunk<
  IDepositAction,
  IDepositActionCreate,
  { dispatch: AppDispatch }
>("admin/createDepositAction", async (dto, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post<IDepositAction>(
      `/deposits-actions`,
      dto
    );

    await Promise.all([
      dispatch(getDepositActions(dto.deposit)),
      dispatch(getDepositDetails(dto.deposit)),
    ]);

    return data;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err?.message ?? "Request failed");
  }
});

// --- Slice ---

export const AdminDepositsSlice = createSlice({
  name: "adminDeposits",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // allDeposits
      .addCase(getAllDeposits.pending, (state) => {
        state.allDepositsStatus = "pending";
      })
      .addCase(getAllDeposits.fulfilled, (state, action) => {
        state.allDepositsStatus = "fulfilled";
        state.allDeposits = action.payload.data;
        state.pageCount = action.payload.pageCount;
        state.total = action.payload.total;
      })
      .addCase(getAllDeposits.rejected, (state, action) => {
        state.allDepositsStatus = "rejected";
        state.error = action.error.message || "Failed to fetch deposits";
      })

      // createDeposit
      .addCase(createDeposit.pending, (state) => {
        state.createDepositStatus = "pending";
      })
      .addCase(createDeposit.fulfilled, (state) => {
        state.createDepositStatus = "fulfilled";
      })
      .addCase(createDeposit.rejected, (state, action) => {
        state.createDepositStatus = "rejected";
        state.error = action.error.message || "Failed to create deposit";
      })
      .addCase(bringForwardCheck.pending, (state) => {
        state.depositCheckStatus = "pending";
      })
      .addCase(bringForwardCheck.fulfilled, (state, action) => {    
        state.depositCheckStatus = "fulfilled";
        state.depositCheck = action.payload;
      })
      .addCase(bringForwardCheck.rejected, (state, action) => {
        state.depositCheckStatus = "rejected";
        state.error = action.error.message || "Failed to check deposit";
      })

      // actions
      .addCase(getDepositActions.pending, (state) => {
        state.depositActionsStatus = "pending";
      })
      .addCase(getDepositActions.fulfilled, (state, action) => {
        state.depositActionsStatus = "fulfilled";
        state.depositActions = action.payload;
      })
      .addCase(getDepositActions.rejected, (state, action) => {
        state.depositActionsStatus = "rejected";
        state.error = action.error.message || "Failed to fetch deposit actions";
      })

      // create action
      .addCase(createDepositAction.pending, (state) => {
        state.createDepositActionStatus = "pending";
      })
      .addCase(createDepositAction.fulfilled, (state) => {
        state.createDepositActionStatus = "fulfilled";
      })
      .addCase(createDepositAction.rejected, (state, action) => {
        state.createDepositActionStatus = "rejected";
        state.error = action.error.message || "Failed to create deposit action";
      })

      // deposit details (נשמר ל-currentDeposit ומסונכרן ל-allDeposits אם קיים)
      .addCase(getDepositDetails.pending, (state) => {
        state.allDepositsStatus = "pending";
      })
      .addCase(getDepositDetails.fulfilled, (state, action) => {
        state.allDepositsStatus = "fulfilled";
        state.currentDeposit = action.payload;
        const idx = state.allDeposits.findIndex(d => d.id === action.payload.id);
        if (idx !== -1) state.allDeposits[idx] = action.payload;
      })
      .addCase(getDepositDetails.rejected, (state, action) => {
        state.allDepositsStatus = "rejected";
        state.error = action.error.message || "Failed to fetch deposit details";
      });
  },
});

export const { setPage } = AdminDepositsSlice.actions;
export default AdminDepositsSlice.reducer;
