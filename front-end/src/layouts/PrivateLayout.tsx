import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../Admin/components/NavBar/NavBar";

export default function PrivateLayout() {
  return (
    <>
      <Navbar />
      <Box>
        <Outlet />
      </Box>
    </>
  );
}

