import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ICreateDeposits,
  IDeposit,
  IDepositAction,
} from "../../../Admin/components/Deposits/depositsDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import {
  FindOptionsGeneric,
  PaginatedResult,
} from "../../../common/indexTypes";
import axios from "axios";

interface AdminDepositType {
  allDeposits: IDeposit[];
  depositActions: IDepositAction[];
  allDepositsStatus: Status;
  createDepositStatus: Status;
  depositActionsStatus: Status;
  error: string | null;
  createDepositActionStatus: Status;
  page: number;
  pageCount: number;
  total: number;
}
const initialState: AdminDepositType = {
  allDeposits: [],
  depositActions: [],
  allDepositsStatus: "idle",
  createDepositStatus: "idle",
  depositActionsStatus: "idle",
  createDepositActionStatus: "idle",
  error: null,
  pageCount: 1,
  page: 1,
  total: 0,
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getAllDeposits = createAsyncThunk<
  PaginatedResult<IDeposit>,
  FindOptionsGeneric
>("admin/getAllDeposits", async (opts) => {
  const response = await axios.get<PaginatedResult<IDeposit>>(
    `${BASE_URL}/deposits`,
    { params: opts }
  );
  return response.data;
});
export const createDeposit = createAsyncThunk(
  "admin/createDeposit",
  async (deposit: ICreateDeposits) => {
    const response = await axios.post<IDeposit>(
      `${BASE_URL}/deposits`,
      deposit
    );
    return response.data;
  }
);
export const createDepositAction = createAsyncThunk(
  "admin/createDepositAction",
  async (depositAction: IDepositAction) => {
    const response = await axios.post<IDepositAction>(
      `${BASE_URL}/deposits-actions`,
      depositAction
    );
    return response.data;
  }
);
export const getDepositActions = createAsyncThunk(
  "admin/getDepositActions",
  async (depositId: number) => {
    console.log(depositId, "depositId in thunk");
    
    const response = await axios.get(
      `${BASE_URL}/deposits-actions/${depositId}`
    );
    console.log(response);
    return response.data;
  }
);
export const getDepositDetails = createAsyncThunk(
  "admin/getDepositDetails",
  async (depositId: number) => {
    const response = await axios.get<IDeposit>(
      `${BASE_URL}/deposits/${depositId}`
    );
    return response.data;
  }
);

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
        .addCase(createDepositAction.pending, (state) => {  
            state.createDepositActionStatus = "pending";
        }   )
        .addCase(createDepositAction.fulfilled, (state) => {
            state.createDepositActionStatus = "fulfilled";
        }   )
        .addCase(createDepositAction.rejected, (state, action) => {                 
            state.createDepositActionStatus = "rejected";
            state.error = action.error.message || "Failed to create deposit action";
        })
        .addCase(getDepositDetails.pending, (state) => {
            state.allDepositsStatus = "pending";
        })
        .addCase(getDepositDetails.fulfilled, (state) => {            
            state.allDepositsStatus = "fulfilled";            
        })        
        .addCase(getDepositDetails.rejected, (state, action) => {
            state.allDepositsStatus = "rejected";
            state.error = action.error.message || "Failed to fetch deposit details";    
        })
    
  },

});
export const { setPage } = AdminDepositsSlice.actions;
export default AdminDepositsSlice.reducer;
