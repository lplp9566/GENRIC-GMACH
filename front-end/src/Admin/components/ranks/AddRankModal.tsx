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
import { RtlProvider } from "../../../Theme/rtl";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { createMembershipRank, getAllMonthlyRanks } from "../../../store/features/admin/adminRankSlice";
import { toast } from "react-toastify";

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
    <RtlProvider>
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
              color: "#fff",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }} dir="rtl">
          {/* <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 3 }}
          >
            אנא מלא/י את כל השדות המסומנים בכוכבית *
          </Typography> */}

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
              InputProps={{
                sx: {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#81c784",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4caf50",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2a8c82",
                  },
                  input: { direction: "rtl", textAlign: "right" },
                },
              }}
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
          <Button onClick={onClose} sx={{ color: "#2a8c82" }}>
            ביטול
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={!name.trim()}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              "&:hover": { bgcolor: "#276f54" },
              "&.Mui-disabled": { bgcolor: "#c8e6c9", color: "#9e9e9e" },
            }}
          >
            הוסף דרגה
          </Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default AddRankModal;
