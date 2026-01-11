import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export function AdminOnlyRoute() {
  const { user } = useSelector((s: RootState) => s.authslice);
  if (!user) return null; 
  return user.is_admin ? <Outlet /> : <Navigate to="/u" replace />;
}

export function UserOnlyRoute() {
  const { user } = useSelector((s: RootState) => s.authslice);
  if (!user) return null;
  return !user.is_admin ? <Outlet /> : <Navigate to="/home" replace />;
}
