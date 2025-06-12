import axios from "axios";
import { IUser, Status } from "../../../components/Users/UsersDto";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

axios.defaults.withCredentials = true;

interface AdminUsersType {
  allUsers: IUser[] | [];
  selectedUser: IUser | null;
  status: Status;
  error: string | null;
}
const initialState: AdminUsersType = {
  allUsers: [],
  selectedUser: null,
  status: "idle",
  error: null,
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
export const getAllUsers = createAsyncThunk("admin/getAllUsers", async () => {
  const response = await axios.get(
    `${BASE_URL}/users`
  );
  console.log(response);
  return response.data;
});

export const AdminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<IUser | null>) {
      state.selectedUser = action.payload;
    },
    // אופציונלי: פעולה לאיפוס הבחירה
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
      });
  },
});
export const { setSelectedUser, clearSelectedUser } = AdminUsersSlice.actions;
export default AdminUsersSlice.reducer;
