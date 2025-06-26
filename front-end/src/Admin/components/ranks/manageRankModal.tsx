import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import { useState } from "react";
import SelectRank from "../SelectRank/SelectRank";
import { ICreateMonthlyRank } from "./ranksDto";
import CloseIcon from "@mui/icons-material/Close";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import { createMonthlyRank, getAllMonthlyRanks } from "../../../store/features/admin/adminRankSlice";
import { toast } from "react-toastify";
interface IManageRankModalProps {
  openManage: boolean;
  onClose: () => void;
}
const manageRankModal: React.FC<IManageRankModalProps> = ({
  openManage,
  onClose,
}: IManageRankModalProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const [manageRank, setManageRank] = useState<ICreateMonthlyRank>({
    amount: 0,
    effective_from: "",
    role: 1,
  });
  const handleSubmit = () => {
    const promise = dispatch(createMonthlyRank(manageRank)).unwrap();
    toast.promise(promise, {
      pending: "ממתין...",
      success: "הדרגה נשמרה בהצלחה!",
      error: "אירעה שגיאה בעת שמירת הדרגה.",
    });
    promise.then(() => {
      setManageRank({ amount: 0, effective_from: "", role: 1 });
      onClose();
      dispatch(getAllMonthlyRanks());
    });
  };

  return (
    <Dialog
      open={openManage}
      onClose={() => {
        onClose;
      }}
      dir="rtl"
      fullWidth
      maxWidth="sm"
      PaperComponent={(props) => <Paper {...props} sx={{ borderRadius: 4 }} />}
    >
      <DialogTitle
        sx={{
          bgcolor: "#2a8c82",
          color: "#fff",
          py: 2,
          textAlign: "center",
          position: "relative",
        }}
      >
        ניהול דרגה
        <IconButton
          sx={{ position: "absolute", top: 8, left: 8, color: "#fff" }}
          onClick={() => {
            onClose();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#e6f9ec", py: 4, px: 4 }}>
        <SelectRank
          onChange={(selectedRankId) =>
            setManageRank({ ...manageRank, role: selectedRankId })
          }
          label="דרגה *"
          value={manageRank.role}
        />
        <TextField
          fullWidth
          type="number"
          label="סכום (₪) *"
          value={manageRank.amount}
          onChange={(e) =>
            setManageRank({ ...manageRank, amount: Number(e.target.value) })
          }
          InputLabelProps={{
            sx: {
              textAlign: "right",
              right: 0,
              left: "auto",
              transformOrigin: "top right",
            },
          }}
          InputProps={{ sx: { "& input": { textAlign: "right" } } }}
          sx={{ mb: 3 }}
        />
        <TextField
          fullWidth
          type="date"
          label="תאריך *"
          name="effective_from"
          value={manageRank.effective_from}
          onChange={(e) =>
            setManageRank({ ...manageRank, effective_from: e.target.value })
          }
          InputLabelProps={{
            shrink: true,
            sx: {
              textAlign: "right",
              right: 0,
              left: "auto",
              transformOrigin: "top right",
            },
          }}
          InputProps={{ sx: { "& input": { textAlign: "right" } } }}
          sx={{ mb: 3 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 2, bgcolor: "#fff" }}>
        <Button
          onClick={() => {
            onClose();
          }}
          sx={{ color: "#2a8c82" }}
        >
          ביטול
        </Button>
        <Button
          onClick={() => {
            handleSubmit();
          }}
          variant="contained"
          disabled={
            !manageRank.amount || !manageRank.effective_from || !manageRank.role
          }
          sx={{ bgcolor: "#2a8c82" }}
        >
          שמירה
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default manageRankModal;
