import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";

import { DonationRow } from "./DonationsTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { updateDonationById } from "../../../store/features/admin/adminDonationsSlice";
import { toast } from "react-toastify";

interface EditDonationModalProps {
  donation: DonationRow;
  open: boolean;
  onClose: () => void;
}

const EditDonationModal = ({
  donation,
  open,
  onClose,
}: EditDonationModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const { id, amount, date } = donation;

  // state עבור העריכה
  const [newAmount, setNewAmount] = useState<number>(amount);
  const [newDate, setNewDate] = useState<string>(
    new Date(date).toISOString().split("T")[0]
  );

  const handleSubmit = async () => {
    try {
      toast.promise(
        dispatch(
          updateDonationById({
            id: Number(id),
            amount: newAmount,
            date: newDate,
          })
        ).unwrap(),
        {
          pending: "מעדכן תרומה...",
          success: "התרומה עודכנה בהצלחה! 👌",
          error: "שגיאה בעדכון התרומה 💥",
        }
      );

      onClose(); // סוגר את המודל אחרי הצלחה
    } catch (err: any) {
      console.error("Update donation failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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

          {/* סוג תרומה (קריאה בלבד) */}
          {/* <TextField
            label="סוג התרומה"
            value={donation_reason}
            select
            fullWidth
            disabled
          >
            <MenuItem value={donation_reason}>{donation_reason}</MenuItem>
          </TextField> */}
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
export default EditDonationModal;


