// src/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import {  validate } from "../store/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import PaymentsPage from "../Admin/pages/PaymentPage";

const Loader = () => (
  <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
    <CircularProgress />
  </Box>
);

export default function ProtectedRoute() {
  const { user, status } = useSelector((s:RootState)=> s.authslice)
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // בדיקת סשן פעם ראשונה
  useEffect(() => {
    if (status === "idle") dispatch(validate());
  }, [status, dispatch]);

  if (status === "pending" || status === "idle") return <Loader />;

  if (!user ) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
   if (!user.is_admin) {
    return <PaymentsPage />;
  }


  return <Outlet />;
}
