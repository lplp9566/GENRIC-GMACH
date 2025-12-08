import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { FC } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  text: string;
}

const ConfirmModal: FC<Props> = ({ open, onClose, onSubmit, text }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      sx={{ direction: "rtl" }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold" textAlign="center">
          {text}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography textAlign="center" color="text.secondary">
          פעולה זו אינה הפיכה
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 2,display: "flex", gap: 2 }}>
        <Button 
          variant="contained" 
          color="error"
          onClick={onSubmit}
          sx={{ px: 4 }}
        >
          כן
        </Button>

        <Button 
          variant="outlined" 
          color="inherit"
          onClick={onClose}
          sx={{ px: 4 }}
        >
          ביטול
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
