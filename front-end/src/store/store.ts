import { configureStore } from "@reduxjs/toolkit";
import adminUsersReducer from "./features/admin/adminUsersSlice";

export const store = configureStore({
  reducer: {
    adminUsers: adminUsersReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;