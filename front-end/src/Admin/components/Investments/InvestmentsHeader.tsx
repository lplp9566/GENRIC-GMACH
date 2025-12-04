import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { StatusGeneric } from "../../../common/indexTypes";
import { RtlProvider } from "../../../Theme/rtl";
import { useState } from "react";
import NewInvestment from "./NewInvestment";
interface InvestmentsHeaderProps {
  filter: StatusGeneric;
  handleFilterChange: (e: any) => void;
}
const InvestmentsHeader = ({ filter, handleFilterChange }: InvestmentsHeaderProps) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
    const [NewInvestmentOpen, setNewInvestmentOpen] = useState(false);
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        width: {
          xs: "100%",
          sm: "90%",
          md: "60%",
          lg: "40%",
        },
        mx: "auto",
        dir: "rtl",
      }}
    >
      <Stack spacing={2}>
        {/* כותרת ואייקון */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <img
            width={48}
            height={48}
            src="https://img.icons8.com/?size=100&id=ek6vl8DEBehk&format=png&color=000000"
            alt="loan"
          />
          <Typography variant="h5" fontWeight={600} textAlign="center">
            ניהול השקעות
          </Typography>
        </Box>

        {/* כפתור + פילטר */}
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
            onClick={() => setNewInvestmentOpen(true)}
            fullWidth={isSm}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              "&:hover": { bgcolor: "#1f645f" },
            }}
          >
            הוסף השקעה
          </Button>
          <RtlProvider>
            <FormControl
              size="small"
              fullWidth={isSm}
              sx={{
                minWidth: { xs: "auto", sm: 160 },
              }}
            >
              <InputLabel
                id="filter-status-label"
                sx={{
                  color: "#424242",
                  fontWeight: 500,
                  "&.Mui-focused": { color: "#2a8c82" },
                }}
              >
                מצב השקעה
              </InputLabel>
              <Select
                labelId="filter-status-label"
                value={filter}
                label="מצב השקעה"
                onChange={handleFilterChange}
                sx={{
                  borderRadius: 1,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#B0B0B0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2a8c82",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2a8c82",
                    borderWidth: 1.5,
                  },
                }}
              >
                <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                <MenuItem value={StatusGeneric.ACTIVE}>פעילות</MenuItem>
                <MenuItem value={StatusGeneric.INACTIVE}>לא פעילות</MenuItem>
              </Select>
            </FormControl>
          </RtlProvider>
        </Box>
      </Stack>
      <NewInvestment open={NewInvestmentOpen} onClose={() => setNewInvestmentOpen(false)} />
    </Paper>
  );
};

export default InvestmentsHeader;
