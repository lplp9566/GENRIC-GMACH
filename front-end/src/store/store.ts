import { configureStore } from "@reduxjs/toolkit";
import adminUsersReducer from "./features/admin/adminUsersSlice";
import adminFundsOverviewReducer from './features/admin/adminFundsOverviewSlice';

export const store = configureStore({
  reducer: {
    adminUsers: adminUsersReducer, 
    adminFundsOverviewReducer: adminFundsOverviewReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;