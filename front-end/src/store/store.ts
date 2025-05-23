import { configureStore } from "@reduxjs/toolkit";
import adminUsersReducer from "./features/admin/adminUsersSlice";
import adminFundsOverviewReducer from './features/admin/adminFundsOverviewSlice';
import { AdminLoansSlice } from "./features/admin/adminLoanSlice";

export const store = configureStore({
  reducer: {
    adminUsers: adminUsersReducer, 
    adminFundsOverviewReducer: adminFundsOverviewReducer,
    adminLoansSlice: AdminLoansSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;