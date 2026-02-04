import { Paper, Stack, Box, Typography, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  setAddDonationDraft,
  setAddDonationModal,
  setWithdrawDonationModal,
} from "../../../store/features/Main/AppMode";
import { useEffect, useState } from "react";
import AddFundModal from "./AddFundModal";
import { getAllFunds } from "../../../store/features/admin/adminDonationsSlice";

const DonationHeader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);
  const [addFundModal, setaddFundModal] = useState(false);
  useEffect(() => {
    dispatch(getAllFunds());
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        // bgcolor: "#FFFFFF",
        width: { xs: "100%", sm: "90%", md: "60%", lg: "40%" },
        mx: "auto",
        dir: "rtl",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" align="center" fontWeight={600}>
            ניהול תרומות
          </Typography>
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/fluency/50/donation.png"
            alt="loan"
          />
        </Box>
        {isAdmin && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                dispatch(setAddDonationDraft(null));
                dispatch(setAddDonationModal(true));
              }}
              sx={{
                width: { xs: "100%", sm: "auto" },
                // backgroundColor: "green",
                // color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgb(26, 29, 27)",
                },
              }}
            >
              הוסף תרומה
            </Button>
            <Button
              onClick={() => dispatch(setWithdrawDonationModal(true))}
              variant="outlined"
              sx={{ width: { xs: "100%", sm: "auto" } }}
              // sx={{
              //   borderColor: "#2a8c82",
              //   color: "#2a8c82",
              //   "&:hover": {
              //     borderColor: "#1b5e20",
              //     color: "#1b5e20",
              //   },
              // }}
            >
              משיכה מקרן{" "}
            </Button>
            <Button
              onClick={() => setaddFundModal(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              הוספת קרן{" "}
            </Button>
          </Box>
        )}
      </Stack>
      {addFundModal && (
        <AddFundModal
          open={addFundModal}
          onClose={() => setaddFundModal(false)}
        />
      )}
    </Paper>
  );
};

export default DonationHeader;
