import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICreateDonation,
  IDonation,
  IUpdateDonation,
} from "../../../Admin/components/Donations/DonationDto";
import { Status } from "../../../Admin/components/Users/UsersDto";

import axios from "axios";

interface AdminDonationType {
  allDonations: IDonation[];
  status: Status;
  error: string | null;
  CreateDonationStatus: Status;
  withdrawStatus: Status;
  editDonationStatus: Status;
}
const BASE_URL = import.meta.env.VITE_BASE_URL;
const initialState: AdminDonationType = {
  allDonations: [],
  error: null,
  status: "idle",
  CreateDonationStatus: "idle",
  withdrawStatus: "idle",
  editDonationStatus: "idle",
};
export const getAllDonations = createAsyncThunk<IDonation[]
>("admin/getAllDonations", async () => {
  const { data } = await axios.get<IDonation[]>(
    `${BASE_URL}/donations`,
  );
  return data;
});
export const createDonation = createAsyncThunk<IDonation, ICreateDonation>(
  "admin/createDonation",
  async (donation) => {
    const { data } = await axios.post<IDonation>(`${BASE_URL}/donations`, donation);
    console.log(data.user.last_name)
    return data; 
  }
);
export const withdrawDonation = createAsyncThunk<IDonation, ICreateDonation>(
  "admin/withdrawDonation",
  async (donation) => {
    const { data } = await axios.post<IDonation>(`${BASE_URL}/donations`, donation);
    return data; 
  }
);
export const updateDonationById = createAsyncThunk<IDonation, IUpdateDonation>(
  "admin/editDonation",
  async (donation) => {
    const { data } = await axios.patch<IDonation>(`${BASE_URL}/donations/${donation.id}`, donation);
    return data;
  }
);
export const AdminDonationsSlice = createSlice({
  name: "adminDonations",
  initialState,
  reducers: {
    // setPage(state, action: PayloadAction<number>) {
    //   state.page = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllDonations.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(getAllDonations.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.allDonations = action.payload;
      })
      .addCase(getAllDonations.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message ?? "Failed to fetch donations";
      })
      .addCase(createDonation.pending, (state) => {
        state.CreateDonationStatus = "pending";
        state.error = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.CreateDonationStatus = "fulfilled";
        state.allDonations.unshift(action.payload );
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.CreateDonationStatus = "rejected";
        state.error = action.error.message ?? "Failed to create donation";
      })
      .addCase(withdrawDonation.pending, (state) => {
        state.withdrawStatus = "idle";
        state.error = null;
      })
      .addCase(withdrawDonation.fulfilled, (state, action) => {
        state.withdrawStatus = "fulfilled";
        state.allDonations.unshift(action.payload as IDonation);
      })
      .addCase(withdrawDonation.rejected, (state, action) => {
        state.withdrawStatus = "rejected";
        state.error = action.error.message ?? "Failed to withdraw donation";
      })
      .addCase(updateDonationById.pending, (state) => {
        state.editDonationStatus = "pending";
        state.error = null;
      })  
      .addCase(updateDonationById.fulfilled, (state, action) => {
        state.editDonationStatus = "fulfilled";
      const update =  action.payload;
      const index = state.allDonations.findIndex((donation) => donation.id === update.id);
      if (index !== -1) {
        state.allDonations[index] = update;
      }
        });
      }}
    )
      
// export const { setPage } = AdminDonationsSlice.actions;
export default AdminDonationsSlice.reducer;
