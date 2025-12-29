import axios from "axios";
import { CreateOrdersReturnDto, OrdersReturnDto, PayOrdersReturnDto } from "../../../Admin/components/StandingOrdersReturn/ordersReturnDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AdminStandingOrderReturnType {
  allOrdersReturn: OrdersReturnDto[];
  status: Status;
  createOrderReturnStatus: Status;
  payOrderReturnStatus: Status;
  error: string | null;

}
const initialState: AdminStandingOrderReturnType = {
  allOrdersReturn: [],
  error: null,
    status: "idle",
    createOrderReturnStatus: "idle",
    payOrderReturnStatus: "idle",
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getAllOrdersReturn = createAsyncThunk(
    "admin/getAllOrdersReturn",
    async () => {
        const response = await axios.get(`${BASE_URL}/order-return`);
        return response.data;
    }
)
export const createOrderReturn = createAsyncThunk(
  "admin/createOrderReturn",
  async (orderReturn: CreateOrdersReturnDto) => {
    const response = await axios.post<OrdersReturnDto>(
      `${BASE_URL}/order-return`,
      orderReturn
    );
    return response.data;
  }
)
export const payOrderReturn = createAsyncThunk(
  "admin/payOrderReturn",
  async (payData:PayOrdersReturnDto) => {
    const response = await axios.post(`${BASE_URL}/order-return/${payData.id}/pay`,payData);
    return response.data;
  }
)
export const  AdminStandingOrderReturnSlice = createSlice({
  name: "adminStandingOrderReturn",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersReturn.pending, (state) => {
        state.status = "idle";    
      })
      .addCase(getAllOrdersReturn.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.allOrdersReturn = action.payload; 
      })
        .addCase(getAllOrdersReturn.rejected, (state, action) => {      
        state.status = "rejected";
        state.error = action.error.message || "Something went wrong";     
      })
      .addCase(createOrderReturn.pending, (state) => {
        state.createOrderReturnStatus = "idle";
        })
        .addCase(createOrderReturn.fulfilled, (state, {payload}) => {
        state.createOrderReturnStatus = "fulfilled";
        state.allOrdersReturn.push(payload);
        }
        )
        .addCase(createOrderReturn.rejected, (state, action) => {
        state.createOrderReturnStatus = "rejected";
        state.error = action.error.message || "Something went wrong";     
        }
        )
        .addCase(payOrderReturn.pending, (state) => {
        state.payOrderReturnStatus = "idle";
        }
        )
        .addCase(payOrderReturn.fulfilled, (state, payload) => {
        state.payOrderReturnStatus = "fulfilled";
        }
        )
        .addCase(payOrderReturn.rejected, (state, action) => {
        state.payOrderReturnStatus = "rejected";
        state.error = action.error.message || "Something went wrong";     
        }
        );
  },
});
export default AdminStandingOrderReturnSlice.reducer;
