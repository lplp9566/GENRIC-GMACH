import axios from "axios";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IAddUserFormData,
  IUser,
  Status,
} from "../../../Admin/components/Users/UsersDto";

axios.defaults.withCredentials = true;

interface AdminUsersType {
  allUsers: IUser[] | [];
  selectedUser: IUser | null;
  status: Status;
  createUserStatus: Status;
  error: string | null;
}
const initialState: AdminUsersType = {
  allUsers: [],
  selectedUser: null,
  status: "idle",
  error: null,
  createUserStatus: "idle",
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getAllUsers = createAsyncThunk(
  "admin/getUsers",
  async (filters: { membershipType?: string; isAdmin: boolean }) => {
    const response = await axios.get(`${BASE_URL}/users`, {
      params: {
        membershipType: filters.membershipType!,
        isAdmin: filters.isAdmin,
      },
    });
    console.log(response.data);
    return response.data;
  }
);
export const createUser = createAsyncThunk(
  "admin/createUser",
  async (user: IAddUserFormData) => {
    const response = await axios.post<IUser>(`${BASE_URL}/users`, user);
    return response.data;
  }
);
export const editUser = createAsyncThunk(
  "admin/editUser",
  async (data: { userId: number; userData: Partial<IUser> }) => {
    const payload = {
      userData: {
        id: data.userId,
        first_name: data.userData.first_name,
        last_name: data.userData.last_name,
        id_number: data.userData.id_number,
        phone_number: data.userData.phone_number,
        email_address: data.userData.email_address,
      },
      paymentData: {
        bank_number: data.userData.payment_details?.bank_number,
        bank_branch: data.userData.payment_details?.bank_branch,
        bank_account_number: data.userData.payment_details?.bank_account_number,
        charge_date: data.userData.payment_details?.charge_date,
        payment_method: data.userData.payment_details?.payment_method,
      },
    };
    const response = await axios.patch<IUser>(
      `${BASE_URL}/users/${data.userId}`,
      payload
    );
    return response.data;
  }
);

export const AdminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<IUser | null>) {
      state.selectedUser = action.payload;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        (state.status = "pending"), (state.error = null), (state.allUsers = []);
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.error = null),
          (state.allUsers = action.payload);
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        (state.status = "rejected"),
          (state.error = action.error.message || null),
          (state.allUsers = []);
      })
      .addCase(createUser.pending, (state) => {
        state.createUserStatus = "pending";
      })
      .addCase(createUser.fulfilled, (state) => {
        state.createUserStatus = "fulfilled";
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserStatus = "rejected";
        state.error = action.error.message || null;
      })
      .addCase(editUser.pending, (state) => {
        state.createUserStatus = "pending";
      })
      .addCase(editUser.fulfilled, (state) => {
        state.createUserStatus = "fulfilled";
      })
      .addCase(editUser.rejected, (state, action) => {
        state.createUserStatus = "rejected";
        state.error = action.error.message || null;
      });
  },
});
export const { setSelectedUser, clearSelectedUser } = AdminUsersSlice.actions;
export default AdminUsersSlice.reducer;
