import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setMonthlyPaymentModalMode } from "../../../../store/features/Main/AppMode";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../../store/store";
const MonthlyPaymentHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);
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
            ניהול דמי חבר
          </Typography>
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/color/48/installment-plan.png"
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
              onClick={() => dispatch(setMonthlyPaymentModalMode(true))}
              sx={{
                width: { xs: "100%", sm: "auto" },
                backgroundColor: "green",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgb(26, 29, 27)",
                },
              }}
            >
              הוסף תשלום
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/rankPage")}
              sx={{
                width: { xs: "100%", sm: "auto" },
                borderColor: "#2a8c82",
                color: "#2a8c82",
                "&:hover": {
                  borderColor: "#1b5e20",
                  color: "#1b5e20",
                },
              }}
            >
              ניהול דרגות
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default MonthlyPaymentHeader;
