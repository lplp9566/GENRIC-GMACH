import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// import { RtlProvider } from "../../../Theme/rtl";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { createMembershipRank, getAllMonthlyRanks } from "../../../store/features/admin/adminRankSlice";
import { toast } from "react-toastify";
import { inputProps } from "../../../common/styles/inpotstels";

interface AddRankModalProps {
  open: boolean;
  onClose: () => void;
}

const AddRankModal: React.FC<AddRankModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = React.useState("");

  const onSubmit = () => {
    const promise = dispatch(createMembershipRank({ name }));
    toast.promise(promise, {
      pending: "ממתין...",
      success: "הדרגה נוספה בהצלחה!",
      error: "אירעה שגיאה בעת הוספת הדרגה.",
    });
    promise.then(() => {
      setName("");
      onClose();
      dispatch(getAllMonthlyRanks());
      
    });
  };
  return (
    // <RtlProvider>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
          component: Paper,
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            py: 2,
            // position: "relative",
          }}
        >
          <Typography variant="h6" sx={{ m: 0, fontWeight: 700 }}>
            הוספת דרגה חדשה
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }} dir="rtl">
          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              marginTop: 2,
            }}
          >
            <TextField
              label="שם דרגה *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              dir="rtl"
              variant="outlined"
              size="medium"
              InputProps={inputProps}
            />
          </Box>
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
            onClick={onSubmit}
            variant="contained"
            disabled={!name.trim()}
            sx={{
              // bgcolor: "#2a8c82",
              // "&:hover": { bgcolor: "#276f54" },
              // "&.Mui-disabled": { bgcolor: "#c8e6c9", color: "#9e9e9e" },
            }}
          >
            הוסף דרגה
          </Button>
                    <Button onClick={onClose} sx={{ color: "#2a8c82" }}>
            ביטול
          </Button>
        </DialogActions>
      </Dialog>
    // </RtlProvider>
  );
};

export default AddRankModal;
