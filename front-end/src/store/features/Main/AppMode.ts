import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
axios.defaults.withCredentials = true;
type DonationKind = "regular" | "fund";
interface AppModeType {
  mode: "admin" | "user";
  LoanModalMode: boolean;
  MonthlyPaymentModalMode?: boolean;
  AddDepositModal?: boolean;
  AddDonationModal?: boolean;
  withdrawDonationModal?: boolean;
  AddDonationDraft?: AddDonationDraft | null;
}
export type AddDonationDraft = {
  userId?: number;
  kind?: DonationKind;
  fundName?: string;
  amount?: number;
  date?: string;
};
const initialState: AppModeType = {
  LoanModalMode: false,
  mode: "admin",
  MonthlyPaymentModalMode: false,
  AddDepositModal: false,
  AddDonationModal: false,
  withdrawDonationModal: false,
  AddDonationDraft: null,
};
export const AppModeSlice = createSlice({
  name: "AppMode",
  initialState,
  reducers: {
    setAppMode(state, action) {
      state.mode = action.payload;
    },
    setLoanModalMode(state, action) {
      state.LoanModalMode = action.payload;
    },
    setMonthlyPaymentModalMode(state, action) {
      state.MonthlyPaymentModalMode = action.payload;
    },
    setAddDepositModal(state, action) {
      state.AddDepositModal = action.payload;
    },
setAddDonationModal(state, action) {
  state.AddDonationModal = action.payload;
  if (!action.payload) state.AddDonationDraft = null; 
},

    setWithdrawDonationModal(state, action) {
      state.withdrawDonationModal = action.payload;
    },
    setAddDonationDraft(state, action) {
      state.AddDonationDraft = action.payload;
    },
  },
});
export const {
  setAppMode,
  setLoanModalMode,
  setMonthlyPaymentModalMode,
  setAddDepositModal,
  setAddDonationModal,
  setWithdrawDonationModal,
  setAddDonationDraft,
} = AppModeSlice.actions;
export default AppModeSlice.reducer;
