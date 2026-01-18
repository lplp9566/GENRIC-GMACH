import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICreateMembershipRank,
  IMembershipRank,
  IMembershipRankDetails,
  IMonthlyRank,
  IUpdateRoleMonthlyRates,
} from "../../../Admin/components/ranks/ranksDto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { api } from "../../axiosInstance";

interface AdminRankState {
  memberShipRanks: IMembershipRank[] | [];
  monthlyRanks: IMembershipRankDetails[] | [];
  updateMembershipRankStatus: Status;
  deleteMembershipRankStatus: Status;
  status: Status;
  error: string | null;
}

const initialState: AdminRankState = {
  memberShipRanks: [],
  monthlyRanks: [],
  status: "idle",
  error: null,
  updateMembershipRankStatus: "idle",
  deleteMembershipRankStatus: "idle",
};
export const getAllMonthlyRanks = createAsyncThunk(
  "admin/getAllMonthlyRanks",
  async () => {
    const response = await api.get(`/membership-roles/with-rates`);
    return response.data;
  }
);
export const getAllMembershipRanks = createAsyncThunk(
  "admin/getAllMembershipRanks",
  async () => {
    const response = await api.get(`/membership-roles`);
    return response.data;
  }
);
export const createMembershipRank = createAsyncThunk(
  "admin/createMembershipRank",
  async (membershipRank: ICreateMembershipRank) => {
    const response = await api.post<ICreateMembershipRank>(
      `/membership-roles`,
      membershipRank
    );
    return response.data;
  }
);
export const createMonthlyRank = createAsyncThunk(
  "admin/createMonthlyRank",
  async (monthlyRank: {
    role: number;
    amount: number;
    effective_from: string;
  }) => {
    const response = await api.post<IMonthlyRank>(
      `/role-monthly-rates`,
      monthlyRank
    );
    return response.data;
  }
);
export const updateMembershipRank = createAsyncThunk(
  "admin/updateMembershipRank",
  async (monthlyRates: IUpdateRoleMonthlyRates) => {
    const response = await api.patch<IUpdateRoleMonthlyRates>(
      `/role-monthly-rates/${monthlyRates.id}`,
      monthlyRates
    );
    return response.data;
  }
);
export const deleteMembershipRank = createAsyncThunk(
  "admin/deleteMembershipRank",
  async (id: number) => {
     await api.delete(`/role-monthly-rates/${id}`);
    return id;
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
        (state.memberShipRanks = []),
          (state.error = action.error.message || null);
      })
      .addCase(createMembershipRank.pending, (state) => {
        (state.status = "pending"), (state.error = null);
      })
      .addCase(createMembershipRank.fulfilled, (state) => {
        state.status = "fulfilled";
        state.error = null;
      })
      .addCase(createMembershipRank.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || null;
      })
      .addCase(createMonthlyRank.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createMonthlyRank.fulfilled, (state) => {
        state.status = "fulfilled";
        state.error = null;
      })
      .addCase(createMonthlyRank.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message || null;
      })
      .addCase(updateMembershipRank.pending, (state) => {
        state.updateMembershipRankStatus = "pending";
        state.error = null;
      })
      .addCase(updateMembershipRank.fulfilled, (state, action) => {
        state.updateMembershipRankStatus = "fulfilled";
        state.error = null;

        const updated = action.payload as IUpdateRoleMonthlyRates; 

        state.monthlyRanks = state.monthlyRanks.map((rank) => ({
          ...rank,
          monthlyRates: rank.monthlyRates.map((rate) =>
            rate.id === updated.id
              ? {
                  ...rate,
                  amount: updated.amount,
                  effective_from: updated.effective_from,
                }
              : rate
          ),
        }));
      })
      .addCase(deleteMembershipRank.pending, (state) => {
        state.deleteMembershipRankStatus = "pending";
        state.error = null;
      })
      .addCase(deleteMembershipRank.fulfilled, (state, action) => {
        state.deleteMembershipRankStatus = "fulfilled";
        const deletedId = action.payload as number;

        state.monthlyRanks = state.monthlyRanks.map((rank) => ({
          ...rank,
          monthlyRates: rank.monthlyRates.filter(
            (rate) => rate.id !== deletedId
          ),
        }));

        state.error = null;
      })

      .addCase(deleteMembershipRank.rejected, (state, action) => {
        state.deleteMembershipRankStatus = "rejected";
        state.error = action.error.message || null;
      });
  },
});
export default AdminRankSlice.reducer;
