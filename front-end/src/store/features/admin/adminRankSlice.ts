import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IMembershipRank, IMonthlyRank } from "../../../Admin/components/ranks/ranksDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import axios from "axios";

interface AdminRankState {
  memberShipRanks: IMembershipRank[] | [];
  monthlyRanks: IMonthlyRank[] | [];
  status:Status;
  error: string | null;
}

const initialState: AdminRankState = {
  memberShipRanks: [],
  monthlyRanks: [],
  status: "idle",
  error: null,
};
const BASE_URL = import.meta.env.VITE_BASE_URL;
const getAllMonthlyRanks = createAsyncThunk(
  "admin/getAllMonthlyRanks",
  async () => {
      const response = await axios.get(`${BASE_URL}/monthly-ranks`);
      return response.data;
  }
);
const getAllMembershipRanks = createAsyncThunk(
  "admin/getAllMembershipRanks",
  async () => {
    const response = await axios.get(`${BASE_URL}/membership-ranks`);
    return response.data;
  }
);

 export const AdminRankSlice = createSlice({
  name: "adminRank",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllMonthlyRanks.pending, (state) => {
        (state.status = "pending"), (state.error = null);
      })
      .addCase(getAllMonthlyRanks.fulfilled, (state, action) => {
        (state.monthlyRanks = action.payload),
          (state.status = "fulfilled"),
          (state.error = null);
      })
      .addCase(getAllMonthlyRanks.rejected, (state, action) => {
        (state.monthlyRanks = []), (state.error = action.error.message || null);
      })
        .addCase(getAllMembershipRanks.pending, (state) => {
            (state.status = "pending"), (state.error = null);
        })
        .addCase(getAllMembershipRanks.fulfilled, (state, action) => {
            (state.memberShipRanks = action.payload),
            (state.status = "fulfilled"),
            (state.error = null);
        })
        .addCase(getAllMembershipRanks.rejected, (state, action) => {
            (state.memberShipRanks = []), (state.error = action.error.message || null);
        });
  },
});
export default AdminRankSlice.reducer;
