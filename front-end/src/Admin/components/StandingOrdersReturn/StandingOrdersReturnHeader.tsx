import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState } from "react";
import { AddStandingOrderRefundModal } from './NewOrderReturn';
import { RtlThemeProvider } from '../../../Theme/rtl';

type StatusFilter = "all" | "paid" | "unpaid";

type StandingOrdersReturnHeaderProps = {
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
};

const StandingOrdersReturnHeader = ({
  statusFilter,
  onStatusChange,
}: StandingOrdersReturnHeaderProps) => {
  const [newOrderOpen, setNewOrderOpen] = useState(false);
    const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Paper
    elevation={3}
    sx={{
      p: 3,
      mb: 4,
        borderRadius: 2,
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
            src="https://img.icons8.com/plasticine/100/return-of-product.png"
            alt="loan"
          />
          <Typography variant="h5" fontWeight={600} textAlign="center">
            ניהול החזרים מהוראות קבע
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
            onClick={() => setNewOrderOpen(true)}
            fullWidth={isSm}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              "&:hover": { bgcolor: "#1f645f" },
            }}
          >
           הוסף החזר הוראת קבע 
          </Button>
          {/* <RtlProvider> */}
          <RtlThemeProvider>
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
                מצב 
              </InputLabel>
              <Select
                labelId="filter-status-label"
                value={statusFilter}
                label="מצב"
                onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
                sx={{
                  borderRadius: 1,
              
                }}
              >
                <MenuItem value="all">???</MenuItem>
                <MenuItem value="paid">????</MenuItem>
                <MenuItem value="unpaid">?? ????</MenuItem>
                <MenuItem >שולם</MenuItem>
                <MenuItem >לא שולם</MenuItem>
              </Select>
            </FormControl>
      </RtlThemeProvider>

        </Box>
      </Stack>
      {newOrderOpen && (
        <AddStandingOrderRefundModal open={newOrderOpen} onClose={() => setNewOrderOpen(false)} />
      )}
    </Paper>
  )
}

export default StandingOrdersReturnHeader