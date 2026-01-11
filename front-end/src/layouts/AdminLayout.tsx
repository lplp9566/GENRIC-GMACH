import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminNavbar from "../Admin/components/NavBar/AdminNavBar/AdminNavBar";

export default function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <Box>
        <Outlet />
      </Box>
    </>
  );
}

