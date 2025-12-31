import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import RankHeader from "../components/ranks/RankHeader";
import AddRankModal from "../components/ranks/AddRankModal";
import ManageRankModal from "../components/ranks/manageRankModal";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getAllMonthlyRanks } from "../../store/features/admin/adminRankSlice";
import FramedContainer from "../components/FramedContainer/FramedContainer";
import AllRanks from "../components/ranks/AllRanks";

const RanksManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAllMonthlyRanks());
  }, [dispatch]);

  const navigate = useNavigate();
  const ranks = useSelector(
    (state: RootState) => state.AdminRankSlice.monthlyRanks
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [openManage, setOpenManage] = useState(false);

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        // bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          // sx={{ color: "#5f7d7b", borderColor: "#5f7d7b" }}
        >
          {"< חזרה"}
        </Button>
        <RankHeader
          handleAddOpen={() => setOpenAdd(true)}
          handleManageOpen={() => setOpenManage(true)}
        />
      </Box>

      <FramedContainer>
        <Box mb={3} textAlign="center">
          <Typography variant="h5" fontWeight={600}>
            דרגות במערכת
          </Typography>
        </Box>
        <AllRanks ranks={ranks} />
      </FramedContainer>
      <AddRankModal open={openAdd} onClose={() => setOpenAdd(false)} />
      <ManageRankModal
        openManage={openManage}
        onClose={() => setOpenManage(false)}
      />
    </Container>
  );
};

export default RanksManagementPage;
