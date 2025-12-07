import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { addToInvestment, applyManagementFee, updateInvestmentValue, withdrawFromInvestment } from "../../../../store/features/admin/adminInvestmentsSlice";

interface InvestmentActionProps {
  investmentId: number;
  onChanged: () => void;
}
type InvestmentActionMode =
  | "add-to-investment"
  | "withdraw"
  | "update-value"
  | "management-fee";
const InvestmentAction: React.FC<InvestmentActionProps> = ({
  investmentId,
  onChanged,
}) => {
  const availableInvestment = useSelector(
    (s: RootState) => s.AdminFundsOverviewReducer.fundsOverview?.available_funds
  );

  const dispatch = useDispatch<AppDispatch>();
  const investment = useSelector((s:RootState)=> s.AdminInvestmentsSlice.allInvestments.find((inv)=> inv.id === investmentId));

  const [mode, setMode] = useState<InvestmentActionMode>("add-to-investment");
  const handleModeChange = (e: SelectChangeEvent) =>
    setMode(e.target.value as InvestmentActionMode);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const onSubmit = async () => {
    if (!amount || !date) {
      toast.error("אנא מלא את כל השדות");
      return;
    }
    if (mode === "add-to-investment") {
      if (Number(amount) > availableInvestment!) {
        toast.error(
          `הסכום שהוזן גבוה מהקרן הזמינה להשקעה: ${availableInvestment} ש"ח`
        );
        return;
      }
      await toast.promise(
        dispatch(
          addToInvestment({
            id: investmentId,
            amount: Number(amount),
            date: new Date(date),
          })
        ).unwrap(),
        {
          pending: "מוסיף להשקעה...",
          success: "הוספה להשקעה בוצעה בהצלחה! 👌",
        }
      );
    }
    if (mode === "withdraw") {
      if( Number(amount) > Number(investment?.current_value!)) {
        toast.error(`הסכום שהוזן גבוה מהערך הנוכחי של ההשקעה: ${investment?.current_value} ש"ח`);
        return;
      }
    await toast.promise(
        dispatch(withdrawFromInvestment({id: investmentId, amount: Number(amount), date: new Date(date)})).unwrap(),
        {
          pending: "מבצע משיכה מההשקעה...",
          success: "המשיכה מההשקעה בוצעה בהצלחה! 👌"
          } ,
      );
    }
    if (mode === "update-value") {
      await toast.promise(
        dispatch(updateInvestmentValue({id: investmentId, new_value: Number(amount), date: new Date(date)})).unwrap(),
        {
          pending: "מעדכן ערך השקעה...",
          success: "עדכון ערך ההשקעה בוצע בהצלחה! 👌"
          } , 

      )
    }
    if (mode === "management-fee") {
      await toast.promise(
        dispatch(applyManagementFee({id: investmentId, feeAmount: Number(amount), date: new Date(date)})).unwrap(),
        {
          pending: "מיישם דמי ניהול...",
          success: "דמי הניהול הוחלו בהצלחה! 👌"
          } ,
      )
    }
 onChanged();
    setAmount(0);
    setDate(""
      )
  };
  return (
    <Box dir="rtl">
      <Paper
        elevation={2}
        sx={{ p: 2, borderRadius: 2, backgroundColor: "#FEFEFE" }}
      >
        <Typography variant="h6" sx={{ textAlign: "center", paddingBottom: 2 }}>
          פעולות להשקעה
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="action-select-label">בחר פעולה</InputLabel>
          <Select
            labelId="action-select-label"
            value={mode}
            label="בחר פעולה"
            onChange={handleModeChange}
            sx={{ backgroundColor: "#FFF", borderRadius: 1 }}
          >
            <MenuItem value="add-to-investment">הוספה להשקעה</MenuItem>
            <MenuItem value={"withdraw"}>משיכה מהשקעה</MenuItem>
            <MenuItem value={"update-value"}>עדכון ערך השקעה</MenuItem>
            <MenuItem value={"management-fee"}>תשלום דמי ניהול</MenuItem>
          </Select>
        </FormControl>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{
            mt: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <TextField
            fullWidth
            label="תאריך "
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="סכום "
            value={amount}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
            onChange={(e) => setAmount(Number(e.target.value))}
            size="small"
            // sx={{ minWidth: 120 }}
          />

          <Button
            // sx={{bgcolor: isValid ? "#113E21" : "grey.500" }}
            fullWidth
            type="submit"
            variant="contained"
            // disabled={!isValid}
          >
            שלח
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvestmentAction;
