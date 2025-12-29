import { configureStore } from "@reduxjs/toolkit";
import  { AdminUsersSlice } from "./features/admin/adminUsersSlice";
import { AdminLoansSlice } from "./features/admin/adminLoanSlice";
import { AppModeSlice } from "./features/Main/AppMode";
import { UserFundsOverviewSlice } from "./features/user/userFundsOverviewSlice";
import { AdminFundsOverviewSlice } from "./features/admin/adminFundsOverviewSlice";
import { AdminMonthlyPaymentsSlice } from "./features/admin/adminMonthlyPayments";
import { AdminRankSlice } from "./features/admin/adminRankSlice";
import { AdminDepositsSlice } from "./features/admin/adminDepositsSlice";
import { Authslice } from "./features/auth/authSlice";
import { AdminDonationsSlice } from "./features/admin/adminDonationsSlice";
import { AdminInvestmentsSlice } from "./features/admin/adminInvestmentsSlice";
import { AdminStandingOrderReturnSlice } from "./features/admin/adminStandingOrderReturt";

export const store = configureStore({
  reducer: {
    AdminUsers: AdminUsersSlice.reducer, 
    AdminFundsOverviewReducer: AdminFundsOverviewSlice.reducer,
    AdminLoansSlice: AdminLoansSlice.reducer,
    mapModeSlice:AppModeSlice.reducer,
    UserFundsOverviewSlice:UserFundsOverviewSlice.reducer,
    AdminMonthlyPaymentsSlice:AdminMonthlyPaymentsSlice.reducer,
    AdminRankSlice: AdminRankSlice.reducer,
    AdminDepositsSlice: AdminDepositsSlice.reducer,
    authslice: Authslice.reducer,
    AdminDonationsSlice: AdminDonationsSlice.reducer,
    AdminInvestmentsSlice: AdminInvestmentsSlice.reducer,
    AdminStandingOrderReturnSlice: AdminStandingOrderReturnSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
