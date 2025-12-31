import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useDispatch } from 'react-redux';
import { setMonthlyPaymentModalMode } from '../../../../store/features/Main/AppMode';
import { useNavigate } from 'react-router-dom';
const MonthlyPaymentHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  return (
          <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            // bgcolor: "#FFFFFF",
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
                ניהול  דמי חבר
              </Typography>
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/installment-plan.png"
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
                onClick={() => dispatch(setMonthlyPaymentModalMode(true))}
                sx={{
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
          </Stack>
        </Paper>
  )
}

export default MonthlyPaymentHeader