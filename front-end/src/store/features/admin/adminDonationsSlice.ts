import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  ICreateDonation,
  ICreateFund,
  IDonation,
  IFundDonation,
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
  fundDonationStatus: Status ;
  fundDonation: IFundDonation[];
  createFundDonationStatus: Status

}
const BASE_URL = import.meta.env.VITE_BASE_URL;
const initialState: AdminDonationType = {
  allDonations: [],
  error: null,
  status: "idle",
  CreateDonationStatus: "idle",
  withdrawStatus: "idle",
  editDonationStatus: "idle",
  fundDonationStatus: "idle",
  fundDonation: [],
  createFundDonationStatus: "idle",
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
export const createFundDonation = createAsyncThunk<IFundDonation, ICreateFund>(
  "admin/createFundDonation",
  async (donation) => {
    const { data } = await axios.post<IFundDonation>(`${BASE_URL}/funds`, donation);
    return data;
  }
)
export const getAllFunds = createAsyncThunk<IFundDonation[]
>("admin/getAllFunds", async () => {
  const { data } = await axios.get<IFundDonation[]>(
    `${BASE_URL}/funds`,
  );
  return data;
})
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
        })
      .addCase(updateDonationById.rejected, (state, action) => {
        state.editDonationStatus = "rejected";
        state.error = action.error.message ?? "Failed to update donation";
      })
      .addCase(createFundDonation.pending, (state) => {
        state.fundDonationStatus = "pending";
        state.error = null;
      })
      .addCase(createFundDonation.fulfilled, (state, action) => {
        state.fundDonationStatus = "fulfilled";
        state.fundDonation.push(action.payload);
      })
      .addCase(createFundDonation.rejected, (state, action) => {
        state.fundDonationStatus = "rejected";
        state.error = action.error.message ?? "Failed to create donation";
      }).addCase(getAllFunds.pending, (state) => {
        state.fundDonationStatus = "pending";
        state.error = null;
      })
      .addCase(getAllFunds.fulfilled, (state, action) => {
        state.fundDonationStatus = "fulfilled";
        state.fundDonation = action.payload;
      })
      .addCase(getAllFunds.rejected, (state, action) => {
        state.fundDonationStatus = "rejected";
        state.error = action.error.message ?? "Failed to fetch donations";

      })
  },

});

      
// export const { setPage } = AdminDonationsSlice.actions;
export default AdminDonationsSlice.reducer;
