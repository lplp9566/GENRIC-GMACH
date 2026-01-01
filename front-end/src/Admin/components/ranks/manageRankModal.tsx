import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SelectRank from "../SelectRank/SelectRank";
import { ICreateMonthlyRank } from "./ranksDto";
import CloseIcon from "@mui/icons-material/Close";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import {
  createMonthlyRank,
  getAllMonthlyRanks,
} from "../../../store/features/admin/adminRankSlice";
import { toast } from "react-toastify";
// import { RtlProvider } from "../../../Theme/rtl";
import { inputProps } from "../../../common/styles/inpotstels";
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
    // <RtlProvider>
      <Dialog
        open={openManage}
        onClose={() => {
          onClose;
        }}
        dir="rtl"
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: Paper,
          sx: {
            borderRadius: 3,
            bgcolor: "#e6f9ec",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#2a8c82",
            color: "#fff",
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography variant="h6" sx={{ m: 0, fontWeight: 700 }}>
            ניהול דרגה{" "}
          </Typography>
          <IconButton
            sx={{ position: "absolute", top: 8, left: 8, color: "#fff" }}
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 4, px: 4 }}>
          <Box sx={{ marginTop: 5, marginBottom: 4 }}>
            <SelectRank
              onChange={(selectedRankId) =>
                setManageRank({ ...manageRank, role: selectedRankId })
              }
              label="דרגה *"
              value={manageRank.role}
            />
          </Box>

          <TextField
            fullWidth
            type="number"
            label="סכום (₪) "
            dir="rtl"
            size="medium"
            value={manageRank.amount}
            InputProps={inputProps}
            onChange={(e) =>
              setManageRank({ ...manageRank, amount: Number(e.target.value) })
            }
            inputProps={{
              step: "0.01", // מאפשר עשרוני
              min: "0",
            }}
          />
          <TextField
            sx={{ marginTop: 4 }}
            fullWidth
            type="date"
            label="תאריך *"
            name="effective_from"
            variant="outlined"
            value={manageRank.effective_from}
            InputProps={inputProps}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(e) =>
              setManageRank({ ...manageRank, effective_from: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 4,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => {
              handleSubmit();
            }}
            variant="contained"
            disabled={
              !manageRank.amount ||
              !manageRank.effective_from ||
              !manageRank.role
            }
            sx={{ bgcolor: "#2a8c82" }}
          >
            שמירה
          </Button>
          <Button
            onClick={() => {
              onClose();
            }}
            sx={{ color: "#2a8c82" }}
          >
            ביטול
          </Button>
        </DialogActions>
      </Dialog>
    // </RtlProvider>
  );
};

export default manageRankModal;
