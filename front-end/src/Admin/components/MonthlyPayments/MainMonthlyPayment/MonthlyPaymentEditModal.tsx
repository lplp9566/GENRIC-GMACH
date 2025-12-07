import  { FC, useState } from "react";
import { IMonthlyPayment } from "../MonthlyPaymentsDto";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { updateMonthlyPayment } from "../../../../store/features/admin/adminMonthlyPayments";
import { payment_method_enum } from "../../Users/UsersDto";
interface MonthlyPaymentProps {
  editMode: boolean;
  onClose: () => void;
  selectedPayment: IMonthlyPayment;
}
const MonthlyPaymentEditModal: FC<MonthlyPaymentProps> = ({
  editMode,
  onClose,
  selectedPayment,
}) => {
  const {
    id,
    user,
    amount,
    deposit_date,
    description,
    payment_method,
  } = selectedPayment;
 
  const dispatch = useDispatch<AppDispatch>();
 const [newDate, setNewDate] = useState<string>(
    new Date(deposit_date).toISOString().split("T")[0]
  );
  const [newAmount, setNewAmount] = useState<number>(amount);
  const [newPaymentMethod, setnewPaymentMethod] = useState<payment_method_enum>(payment_method);
  const [descriptionText, setDescriptionText] = useState<string>(description || "");   
  const newMonth = new Date(newDate).getMonth() + 1;
  const newYear = new Date(newDate).getFullYear();
  const handleSubmit = async () => {
    try {
      toast.promise(
        dispatch(
          updateMonthlyPayment({
            id: Number(id),
            amount: newAmount,
            deposit_date: newDate,
            description: descriptionText,
            month: newMonth,
            year: newYear,
            payment_method: newPaymentMethod,
            user,
          })
        ).unwrap(),
        {
          pending: "מעדכן תרומה...",
          success: "התרומה עודכנה בהצלחה! 👌",
          error: "שגיאה בעדכון התרומה 💥",
        }
      );

      onClose();
    } catch (error) {}
  };
  return (
    <Dialog open={editMode} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>עריכת תרומה</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* סכום */}
          <TextField
            label="סכום תרומה"
            fullWidth
            value={newAmount}
            onChange={(e) => setNewAmount(Number(e.target.value))}
          />

          {/* תאריך */}
          <TextField
            label="תאריך"
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

            <TextField
            label="תיאור"
            fullWidth
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
          />
          {/* סוג תרומה (קריאה בלבד) */}
       
        <Select
          dir="rtl"
          name="payment_method"
          value={newPaymentMethod}
          label="אופן תשלום"
          onChange={(e) => setnewPaymentMethod(e.target.value as payment_method_enum)}
        >
          <MenuItem dir="rtl" value={payment_method_enum.direct_debit}>
            הוראת קבע
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.cash}>
            מזומן
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.credit_card}>
            כרטיס אשראי
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.bank_transfer}>
            העברה בנקאית
          </MenuItem>
          <MenuItem dir="rtl" value={payment_method_enum.other}>
            אחר
          </MenuItem>
        </Select>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button variant="contained" onClick={handleSubmit}>
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonthlyPaymentEditModal;
