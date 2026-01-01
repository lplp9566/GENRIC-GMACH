import { FC, useState } from "react";
import { DepositActionsType, IDepositActionCreate } from "../depositsDto";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import DepositAmountChange from "./DepositAmountChange";
import DepositDateChange from "./DepositDateChange";
import DepositAmountRemove from "./DepositAmountRemove";
import { RtlThemeProvider } from "../../../../Theme/rtl";
interface IDepositsActionsProps {
  depositId: number;
  max: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
}
const DepositsActions: FC<IDepositsActionsProps> = ({
  depositId,
  max,
  handleSubmit,
}) => {
  const [mode, setMode] = useState<DepositActionsType>(
    DepositActionsType.AddToDeposit
  );
  const handleModeChange = (e: SelectChangeEvent) => {
    setMode(e.target.value as DepositActionsType);
  };

  return (
    <Box dir="rtl">
      <RtlThemeProvider>
        <Paper
          elevation={2}
          sx={{ p: 2, borderRadius: 2 }}
        >
          <Typography
            variant="h6"
            sx={{ textAlign: "center", paddingBottom: 2 }}
          >
            פעולות על הפקדה
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel id="action-select-label">בחר פעולה</InputLabel>
            <Select
              labelId="action-select-label"
              value={mode}
              label="בחר פעולה"
              onChange={handleModeChange}
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value={DepositActionsType.AddToDeposit}>
                הוספה להפקדה{" "}
              </MenuItem>
              <MenuItem value={DepositActionsType.ChangeReturnDate}>
                שינוי תאריך החזרת ההפקדה{" "}
              </MenuItem>
              <MenuItem value={DepositActionsType.RemoveFromDeposit}>
                הסרה מהפקדה
              </MenuItem>
            </Select>
          </FormControl>


          {mode === DepositActionsType.AddToDeposit && (
            <DepositAmountChange
            depositId={depositId}
            handleSubmit={handleSubmit}
            />
          )}
          {mode === DepositActionsType.ChangeReturnDate && (
            <DepositDateChange
            depositId={depositId}
            handleSubmit={handleSubmit}
            />
          )}
          {mode === DepositActionsType.RemoveFromDeposit && (
            <DepositAmountRemove
            depositId={depositId}
            max={max}
            handleSubmit={handleSubmit}
            />
          )}
        </Paper>
          </RtlThemeProvider>
    </Box>
  );
};

export default DepositsActions;
