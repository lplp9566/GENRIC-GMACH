import {
  CreateOrdersReturnDto,
  IOrdersReturnDto,
  PayOrdersReturnDto,
} from "../../../Admin/components/StandingOrdersReturn/ordersReturnDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../axiosInstance";

interface AdminStandingOrderReturnType {
  allOrdersReturn: IOrdersReturnDto[] | [];
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
export const getAllOrdersReturn = createAsyncThunk(
  "admin/getAllOrdersReturn",
  async () => {
    const response = await api.get(`/order-return`);
    return response.data;
  }
);
export const getOrdersReturnByUserId = createAsyncThunk(
  "admin/getOrdersReturnByUserId",
  async (userId: number) => {
    const response = await api.get<IOrdersReturnDto[]>(
      `/order-return/user/${userId}`,
    );
    return response.data;
  }
);
export const createOrderReturn = createAsyncThunk(
  "admin/createOrderReturn",
  async (orderReturn: CreateOrdersReturnDto) => {
    console.log(orderReturn);

    const response = await api.post<IOrdersReturnDto>(
      `/order-return`,
      orderReturn
    );
    return response.data;
  }
);
export const payOrderReturn = createAsyncThunk(
  "admin/payOrderReturn",
  async (payData: PayOrdersReturnDto) => {
    const response = await api.post(
      `/order-return/${payData.id}/pay`,
      payData
    );
    return response.data;
  }
);
export const AdminStandingOrderReturnSlice = createSlice({
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
      .addCase(getOrdersReturnByUserId.pending, (state) => {
        state.status = "idle";
      })
      .addCase(getOrdersReturnByUserId.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.allOrdersReturn = action.payload;
      })
      .addCase(getOrdersReturnByUserId.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(createOrderReturn.pending, (state) => {
        state.createOrderReturnStatus = "idle";
      })
      .addCase(createOrderReturn.fulfilled, (state, { payload }) => {
        state.createOrderReturnStatus = "fulfilled";
        state.allOrdersReturn = [...state.allOrdersReturn, payload];
      })
      .addCase(createOrderReturn.rejected, (state, action) => {
        state.createOrderReturnStatus = "rejected";
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(payOrderReturn.pending, (state) => {
        state.payOrderReturnStatus = "idle";
      })
      .addCase(payOrderReturn.fulfilled, (state, payload) => {
        state.payOrderReturnStatus = "fulfilled";
        state.allOrdersReturn[
          state.allOrdersReturn.findIndex(
            (orderReturn) => orderReturn.id === payload.payload.id
          )
        ] = payload.payload;
      })
      .addCase(payOrderReturn.rejected, (state, action) => {
        state.payOrderReturnStatus = "rejected";
        state.error = action.error.message || "Something went wrong";
      });
  },
});
export default AdminStandingOrderReturnSlice.reducer;
