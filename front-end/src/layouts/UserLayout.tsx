import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import UserNavbar from "../Admin/components/NavBar/UserNavBar/UserNavBar";
 // תבנה אותו

export default function UserLayout() {
  return (
    <>
      <UserNavbar />
      <Box>
        <Outlet />
      </Box>
    </>
  );
}
