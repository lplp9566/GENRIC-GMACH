import { Paper, Stack, Box, Typography, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import {
  setAddDonationModal,
  setWithdrawDonationModal,
} from "../../../store/features/Main/AppMode";

const DonationHeader = () => {
  const dispatch = useDispatch<AppDispatch>();

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
            onClick={() => dispatch(setAddDonationModal(true))}
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
        </Box>
      </Stack>
    </Paper>
  );
};

export default DonationHeader;
