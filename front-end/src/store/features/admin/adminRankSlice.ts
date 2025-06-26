import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICreateMembershipRank, IMembershipRank, IMembershipRankDetails, IMonthlyRank } from "../../../Admin/components/ranks/ranksDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import axios from "axios";

interface AdminRankState {
  memberShipRanks: IMembershipRank[] | [];
  monthlyRanks: IMembershipRankDetails[] | [];
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
 export const getAllMonthlyRanks = createAsyncThunk(
  "admin/getAllMonthlyRanks",
  async () => {
      const response = await axios.get(`${BASE_URL}/membership-roles/with-rates`);
      return response.data;
  }
);
 export const getAllMembershipRanks = createAsyncThunk(
  "admin/getAllMembershipRanks",
  async () => {
    const response = await axios.get(`${BASE_URL}/membership-roles`);
    return response.data;
  }
);
 export const createMembershipRank = createAsyncThunk(
  "admin/createMembershipRank",
  async (membershipRank: ICreateMembershipRank) => {
    const response = await axios.post<ICreateMembershipRank>(
      `${BASE_URL}/membership-roles`,
      membershipRank
    );
    return response.data;
  }
);
export const createMonthlyRank = createAsyncThunk(
  "admin/createMonthlyRank",
    async (monthlyRank: { role: number; amount: number; effective_from: string }) => {
        const response = await axios.post<IMonthlyRank>(
        `${BASE_URL}/role-monthly-rates`,
        monthlyRank
        );
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
        })
        .addCase(createMembershipRank.pending, (state) => { 
            (state.status = "pending"), (state.error = null);
        }
        )
        .addCase(createMembershipRank.fulfilled, (state) => {
            state.status = "fulfilled";
            state.error = null;
        }
    )
        .addCase(createMembershipRank.rejected, (state, action) => {
            state.status = "rejected";
            state.error = action.error.message || null;
        });
  },
});
export default AdminRankSlice.reducer;
