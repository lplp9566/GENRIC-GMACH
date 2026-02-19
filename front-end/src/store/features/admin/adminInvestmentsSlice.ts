import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    createInvestment,
  InvestmentDto,
  TransactionDto,
} from "../../../Admin/components/Investments/InvestmentDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { api } from "../../axiosInstance";

interface AdminInvestmentType {
  allInvestments: InvestmentDto[];
  allInvestmentTransactions: TransactionDto[];
  getAllInvestmentsStatus: Status;
  getInvestmentByIdStatus: Status;
  getTransactionsByInvestmentIdStatus: Status;
  getAllInvestmentTransactionsStatus: Status;
  createInvestmentStatus: Status;
  addToInvestmentStatus: Status;
  updateInvestmentValueStatus: Status;
  withdrawFromInvestmentStatus: Status;
  applyManagementFeeStatus: Status;
  editInvestmentStatus: Status;
  deleteInvestmentStatus: Status;
  error: string | null;
  page: number;
  pageCount: number;
  total: number;
  investmentDetails: InvestmentDto | null;
  investmentTransactions: TransactionDto[];
}
const initialState: AdminInvestmentType = {
  allInvestments: [],
  allInvestmentTransactions: [],
  error: null,
  page: 1,
  pageCount: 1,
  total: 0,
  getAllInvestmentsStatus: "idle",
  getInvestmentByIdStatus: "idle",
  getTransactionsByInvestmentIdStatus: "idle",
  getAllInvestmentTransactionsStatus: "idle",
  createInvestmentStatus: "idle",
  addToInvestmentStatus: "idle",
  updateInvestmentValueStatus: "idle",
  withdrawFromInvestmentStatus: "idle",
  applyManagementFeeStatus: "idle",
  editInvestmentStatus: "idle",
  deleteInvestmentStatus: "idle",
  investmentDetails: null,
  investmentTransactions: [],
};

export const getAllInvestments = createAsyncThunk<
  InvestmentDto[]
>("admin/getAllInvestments", async () => {
    const response = await api.get<InvestmentDto[]>(    
      `/investments`,
    );
    return response.data;
})
export const getInvestmentById = createAsyncThunk
("admin/getInvestmentById", async (id:number) => {
    const response = await api.post<InvestmentDto>(    
      `/investments/get-by-id`,    
       {id} 
    );
    return response.data;
});
export const getTransactionsByInvestmentId = createAsyncThunk
("admin/getTransactionsByInvestmentId", async (investmentId:number) => {
    const response = await api.post<TransactionDto[]>(    
      `/investment-transactions/by-investment`,    
        { investmentId }
    );
    return response.data;
});
export const getAllInvestmentTransactions = createAsyncThunk<
  TransactionDto[]
>("admin/getAllInvestmentTransactions", async () => {
  const response = await api.get<TransactionDto[]>(`/investment-transactions/all`);
  return response.data;
});
export const createInitialInvestment = createAsyncThunk(
  "admin/createInitialInvestment",
  async (investmentData: createInvestment) => {    
    const response = await api.post<InvestmentDto>(    
      `/investments`,    
      investmentData
    );
    return response.data;
  }
);
export const addToInvestment = createAsyncThunk(
  "admin/addToInvestment",
  async (data: { id: number; amount: number; date: Date }) => {
    const response = await api.post<InvestmentDto>(
        `/investments/add-to-investment`,
        data
    );
    return response.data;
  }
);
export const updateInvestmentValue = createAsyncThunk(
  "admin/updateInvestmentValue",
  async (data: { id: number; new_value: number; date: Date }) => {  
    const response = await api.post<InvestmentDto>(
        `/investments/update-value`,
        data
    );
    return response.data;
  }
);
export const withdrawFromInvestment = createAsyncThunk(
  "admin/withdrawFromInvestment",
  async (data: { id: number; amount: number; date: Date }) => { 
    const response = await api.post<InvestmentDto>(
        `/investments/withdraw`,
        data
    );
    return response.data;
  }
);
export const applyManagementFee = createAsyncThunk(
  "admin/applyManagementFee",
  async (data: { id: number; feeAmount: number; date: Date }) => {
    const response = await api.post<InvestmentDto>(
        `/investments/management-fee`,
        data  
    );
    return response.data;
  }
);
export const updateInvestmentById = createAsyncThunk(
  "admin/updateInvestmentById",
  async (
    data: {
      id: number;
      investment_name?: string;
      investment_by?: string;
      company_name?: string;
      investment_portfolio_number?: string;
      start_date?: Date;
    }
  ) => {
    const { id, ...payload } = data;
    const response = await api.patch<InvestmentDto>(`/investments/${id}`, payload);
    return response.data;
  }
);
export const deleteInvestmentById = createAsyncThunk(
  "admin/deleteInvestmentById",
  async (id: number) => {
    await api.delete(`/investments/${id}`);
    return id;
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
        )
        .addCase(getAllInvestmentTransactions.pending, (state) => {
            state.getAllInvestmentTransactionsStatus = "idle";
        })
        .addCase(getAllInvestmentTransactions.fulfilled, (state, action) => {
            state.getAllInvestmentTransactionsStatus = "fulfilled";
            state.allInvestmentTransactions = action.payload;
        })
        .addCase(getAllInvestmentTransactions.rejected, (state, action) => {
            state.getAllInvestmentTransactionsStatus = "rejected";
            state.error = action.error.message || "Failed to fetch all investment transactions";
        })
        .addCase(createInitialInvestment.pending, (state) => {
            state.createInvestmentStatus = "pending";
            state.error = null;
        })
        .addCase(createInitialInvestment.fulfilled, (state, action) => {
            state.createInvestmentStatus = "fulfilled";
            state.allInvestments.unshift(action.payload);
        })
        .addCase(createInitialInvestment.rejected, (state, action) => {
            state.createInvestmentStatus = "rejected";
            state.error = action.error.message || "Failed to create investment";
        })
        .addCase(updateInvestmentById.pending, (state) => {
            state.editInvestmentStatus = "pending";
            state.error = null;
        })
        .addCase(updateInvestmentById.fulfilled, (state, action) => {
            state.editInvestmentStatus = "fulfilled";
            const updated = action.payload;
            const idx = state.allInvestments.findIndex((x) => x.id === updated.id);
            if (idx !== -1) state.allInvestments[idx] = updated;
            if (state.investmentDetails?.id === updated.id) {
              state.investmentDetails = updated;
            }
        })
        .addCase(updateInvestmentById.rejected, (state, action) => {
            state.editInvestmentStatus = "rejected";
            state.error = action.error.message || "Failed to update investment";
        })
        .addCase(deleteInvestmentById.pending, (state) => {
            state.deleteInvestmentStatus = "pending";
            state.error = null;
        })
        .addCase(deleteInvestmentById.fulfilled, (state, action) => {
            state.deleteInvestmentStatus = "fulfilled";
            const id = action.payload;
            state.allInvestments = state.allInvestments.filter((x) => x.id !== id);
            if (state.investmentDetails?.id === id) {
              state.investmentDetails = null;
            }
            state.investmentTransactions = state.investmentTransactions.filter(
              (tx) => tx.investment?.id !== id
            );
        })
        .addCase(deleteInvestmentById.rejected, (state, action) => {
            state.deleteInvestmentStatus = "rejected";
            state.error = action.error.message || "Failed to delete investment";
       } )

    },
});
export default AdminInvestmentsSlice.reducer;
