import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    createInvestment,
  InvestmentDto,
  TransactionDto,
} from "../../../Admin/components/Investments/InvestmentDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import axios from "axios";

interface AdminInvestmentType {
  allInvestments: InvestmentDto[];
  getAllInvestmentsStatus: Status;
  getInvestmentByIdStatus: Status;
  getTransactionsByInvestmentIdStatus: Status;
  createInvestmentStatus: Status;
  addToInvestmentStatus: Status;
  updateInvestmentValueStatus: Status;
  withdrawFromInvestmentStatus: Status;
  applyManagementFeeStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  investmentDetails: InvestmentDto | null;
  investmentTransactions: TransactionDto[];
}
const initialState: AdminInvestmentType = {
  allInvestments: [],
  error: null,
  page: 1,
  pageCount: 1,
  total: 0,
  getAllInvestmentsStatus: "idle",
  getInvestmentByIdStatus: "idle",
  getTransactionsByInvestmentIdStatus: "idle",
  createInvestmentStatus: "idle",
  addToInvestmentStatus: "idle",
  updateInvestmentValueStatus: "idle",
  withdrawFromInvestmentStatus: "idle",
  applyManagementFeeStatus: "idle",
  investmentDetails: null,
  investmentTransactions: [],
};
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getAllInvestments = createAsyncThunk<
  InvestmentDto[]
>("admin/getAllInvestments", async () => {
    const response = await axios.get<InvestmentDto[]>(    
      `${BASE_URL}/investments`,
    );
    return response.data;
})
export const getInvestmentById = createAsyncThunk
("admin/getInvestmentById", async (id:number) => {
    const response = await axios.post<InvestmentDto>(    
      `${BASE_URL}/investments/get-by-id`,    
       id 
    );
    return response.data;
});
export const getTransactionsByInvestmentId = createAsyncThunk
("admin/getTransactionsByInvestmentId", async (investmentId:number) => {
    const response = await axios.post<TransactionDto[]>(    
      `${BASE_URL}/investment-transactions/by-investment`,    
       investmentId
    );
    return response.data;
});
export const createInitialInvestment = createAsyncThunk(
  "admin/createInitialInvestment",
  async (investmentData: createInvestment) => {    
    const response = await axios.post<InvestmentDto>(    
      `${BASE_URL}/investments`,    
      investmentData
    );
    return response.data;
  }
);
export const addToInvestment = createAsyncThunk(
  "admin/addToInvestment",
  async (data: { id: number; amount: number; date: Date }) => {
    const response = await axios.post<InvestmentDto>(
        `${BASE_URL}/investments/add-to-investment`,
        data
    );
    return response.data;
  }
);
export const updateInvestmentValue = createAsyncThunk(
  "admin/updateInvestmentValue",
  async (data: { id: number; new_value: number; date: Date }) => {  
    const response = await axios.post<InvestmentDto>(
        `${BASE_URL}/investments/update-value`,
        data
    );
    return response.data;
  }
);
export const withdrawFromInvestment = createAsyncThunk(
  "admin/withdrawFromInvestment",
  async (data: { id: number; amount: number; date: Date }) => { 
    const response = await axios.post<InvestmentDto>(
        `${BASE_URL}/investments/withdraw`,
        data
    );
    return response.data;
  }
);
export const applyManagementFee = createAsyncThunk(
  "admin/applyManagementFee",
  async (data: { id: number; feeAmount: number; date: Date }) => {
    const response = await axios.post<InvestmentDto>(
        `${BASE_URL}/investments/management-fee`,
        data    
    );
    return response.data;
  }
);
export const AdminInvestmentsSlice = createSlice({
    name: "adminInvestments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(getAllInvestments.pending, (state) => {
            state.getAllInvestmentsStatus = "idle";
        }
        )
        .addCase(getAllInvestments.fulfilled, (state, action) => {
            state.getAllInvestmentsStatus = "fulfilled";
            state.allInvestments = action.payload;
        }       
        )
        .addCase(getAllInvestments.rejected, (state, action) => {
            state.getAllInvestmentsStatus = "rejected";
            state.error = action.error.message || "Failed to fetch investments";
        }
        )   
        .addCase(getInvestmentById.pending, (state) => {
            state.getInvestmentByIdStatus = "idle";
        }
        )
        .addCase(getInvestmentById.fulfilled, (state, action) => {
            state.getInvestmentByIdStatus = "fulfilled";
            state.investmentDetails = action.payload;
        }       
        )
        .addCase(getInvestmentById.rejected, (state, action) => {
            state.getInvestmentByIdStatus = "rejected";
            state.error = action.error.message || "Failed to fetch investment details";
        }
        )
        .addCase(getTransactionsByInvestmentId.pending, (state) => {
            state.getTransactionsByInvestmentIdStatus = "idle";
        }   
        )
        .addCase(getTransactionsByInvestmentId.fulfilled, (state, action) => {
            state.getTransactionsByInvestmentIdStatus = "fulfilled";
            state.investmentTransactions = action.payload;
        }       
        )
        .addCase(getTransactionsByInvestmentId.rejected, (state, action) => {
            state.getTransactionsByInvestmentIdStatus = "rejected";
            state.error = action.error.message || "Failed to fetch investment transactions";
        }
        );
    },
});
export default AdminInvestmentsSlice.reducer;
