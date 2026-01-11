import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { validate } from "../store/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";

const Loader = () => (
  <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
    <CircularProgress />
  </Box>
);

export default function AuthGuard() {
  const { user, status } = useSelector((s: RootState) => s.authslice);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (status === "idle") dispatch(validate());
  }, [status, dispatch]);

  if (status === "pending" || status === "idle") return <Loader />;

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
