import { configureStore } from "@reduxjs/toolkit";
import  { AdminUsersSlice } from "./features/admin/adminUsersSlice";
import { AdminLoansSlice } from "./features/admin/adminLoanSlice";
import { AppModeSlice } from "./features/Main/AppMode";
import { UserFundsOverviewSlice } from "./features/user/userFundsOverviewSlice";
import { AdminFundsOverviewSlice } from "./features/admin/adminFundsOverviewSlice";

export const store = configureStore({
  reducer: {
    adminUsers: AdminUsersSlice.reducer, 
    adminFundsOverviewReducer: AdminFundsOverviewSlice.reducer,
    adminLoansSlice: AdminLoansSlice.reducer,
    mapModeSlice:AppModeSlice.reducer,
    UserFundsOverviewSlice:UserFundsOverviewSlice.reducer

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
