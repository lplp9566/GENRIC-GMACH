import { FC, useEffect, useMemo, useState } from "react";
import { DepositActionsType, IDepositAction, IDepositActionCreate, IDeposit } from "../depositsDto";
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
  initialAction?: IDepositAction | null;
  depositOptions?: IDeposit[];
  selectedDepositId?: number;
  onDepositChange?: (depositId: number) => void;
  showDepositSelect?: boolean;
}

const toInputDate = (value?: Date | string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const DepositsActions: FC<IDepositsActionsProps> = ({
  depositId,
  max,
  handleSubmit,
  initialAction,
  depositOptions,
  selectedDepositId,
  onDepositChange,
  showDepositSelect,
}) => {
  const [mode, setMode] = useState<DepositActionsType>(DepositActionsType.AddToDeposit);
  const [depositIdLocal, setDepositIdLocal] = useState<number>(selectedDepositId ?? depositId);

  useEffect(() => {
    setDepositIdLocal(selectedDepositId ?? depositId);
  }, [selectedDepositId, depositId]);

  useEffect(() => {
    const type = (initialAction as any)?.action_type ?? (initialAction as any)?.actionType;
    if (type) {
      setMode(type as DepositActionsType);
    }
  }, [initialAction]);

  const resolvedDepositOptions = useMemo(() => {
    return (depositOptions ?? []).filter((d) => d?.isActive);
  }, [depositOptions]);

  const shouldShowDepositSelect = showDepositSelect ?? false;
  const initialDate = toInputDate(initialAction?.date);
  const initialAmount = Number(initialAction?.amount ?? 0);

  const handleModeChange = (e: SelectChangeEvent) => {
    setMode(e.target.value as DepositActionsType);
  };

  return (
    <Box dir="rtl">
      <RtlThemeProvider>
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ textAlign: "center", pb: 2 }}>
            פעולות על ההפקדה
          </Typography>

          {shouldShowDepositSelect && resolvedDepositOptions.length > 0 && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="deposit-select-label">הפקדה</InputLabel>
              <Select
                labelId="deposit-select-label"
                value={depositIdLocal}
                label="הפקדה"
                onChange={(e) => {
                  const nextId = Number(e.target.value);
                  setDepositIdLocal(nextId);
                  onDepositChange?.(nextId);
                }}
              >
                {resolvedDepositOptions.map((d) => {
                  const fullName = `${d?.user?.first_name ?? ""} ${d?.user?.last_name ?? ""}`.trim();
                  return (
                    <MenuItem key={d.id} value={d.id}>
                      {`הפקדה #${d.id}${fullName ? ` - ${fullName}` : ""}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="action-select-label">בחר פעולה</InputLabel>
            <Select
              labelId="action-select-label"
              value={mode}
              label="בחר פעולה"
              onChange={handleModeChange}
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value={DepositActionsType.AddToDeposit}>הוספה להפקדה</MenuItem>
              <MenuItem value={DepositActionsType.ChangeReturnDate}>שינוי תאריך החזרת ההפקדה</MenuItem>
              <MenuItem value={DepositActionsType.RemoveFromDeposit}>הסרה מהפקדה</MenuItem>
            </Select>
          </FormControl>

          {mode === DepositActionsType.AddToDeposit && (
            <DepositAmountChange
              depositId={depositIdLocal}
              handleSubmit={handleSubmit}
              initialDate={initialDate}
              initialAmount={initialAmount > 0 ? initialAmount : undefined}
              submitLabel={initialAction ? "שכפל פעולה" : "עדכן"}
            />
          )}

          {mode === DepositActionsType.ChangeReturnDate && (
            <DepositDateChange depositId={depositIdLocal} handleSubmit={handleSubmit} />
          )}

          {mode === DepositActionsType.RemoveFromDeposit && (
            <DepositAmountRemove
              depositId={depositIdLocal}
              max={max}
              handleSubmit={handleSubmit}
              initialDate={initialDate}
              initialAmount={initialAmount > 0 ? initialAmount : undefined}
              submitLabel={initialAction ? "שכפל פעולה" : "עדכן"}
            />
          )}
        </Paper>
      </RtlThemeProvider>
    </Box>
  );
};

export default DepositsActions;
