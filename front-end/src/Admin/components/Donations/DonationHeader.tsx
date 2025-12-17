import { Paper, Stack, Box, Typography, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
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
const [addFundModal, setaddFundModal] = useState(false)
  useEffect(() => {
    
  dispatch(getAllFunds())

  }, [])
    
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        width: "40%",
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
         onClick={() => {
  dispatch(setAddDonationDraft(null));
  dispatch(setAddDonationModal(true));
}}

            sx={{
              backgroundColor: "green",
              color: "#ffffff",
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
            sx={{
              borderColor: "#2a8c82",
              color: "#2a8c82",
              "&:hover": {
                borderColor: "#1b5e20",
                color: "#1b5e20",
              },
            }}
          >
            משיכה מקרן{" "}
          </Button>
          <Button onClick={()=> setaddFundModal(true)}>הוספת קרן </Button>
        </Box>
      </Stack>
      {addFundModal && <AddFundModal open={addFundModal} onClose={() => setaddFundModal(false)} />}
    </Paper>
  );
};

export default DonationHeader;
