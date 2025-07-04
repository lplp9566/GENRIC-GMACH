import axios from "axios";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAddUserFormData, IUser, Status } from "../../../Admin/components/Users/UsersDto";

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
export const getAllUsers = createAsyncThunk("admin/getAllUsers", async () => {
  const response = await axios.get(
    `${BASE_URL}/users`
  );
  return response.data;
});
export const createUser = createAsyncThunk(
  "admin/createUser",
  async (user: IAddUserFormData) => {
    const response = await axios.post<IUser>(`${BASE_URL}/users`, user);
    return response.data;
  }
)

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
      });
  },
});
export const { setSelectedUser, clearSelectedUser } = AdminUsersSlice.actions;
export default AdminUsersSlice.reducer;
