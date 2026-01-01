import { FC, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { AppDispatch } from '../../../store/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createFundDonation } from '../../../store/features/admin/adminDonationsSlice';
import { RtlThemeProvider } from '../../../Theme/rtl';
interface AddFundModalProps {
    open: boolean;
    onClose: () => void;
}
const AddFundModal:FC<AddFundModalProps> = ({open, onClose}) => {
      const dispatch = useDispatch<AppDispatch>();

    const [name, setName] = useState("");
    const onSubmit =async () => {
        console.log(name);
        
        toast.promise(
            dispatch(createFundDonation({ name })),
            {
                pending: "ממתין...",
                success: "הקרן נוספה בהצלחה!",
                error: "אירעה שגיאה בעת הוספת הקרן.",
            }
        )
        onClose();
    }
  return (
          <RtlThemeProvider>

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
        //   component: Paper,
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{ bgcolor: "green", color: "#fff", py: 2, textAlign: "center" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            הוספת קרן חדשה
          </Typography>
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
              label="שם קרן *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              dir="rtl"
              variant="outlined"
              size="medium"
            //   InputProps={inputProps}
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
            disabled={!name}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              "&:hover": { bgcolor: "#276f54" },
              "&.Mui-disabled": { bgcolor: "#c8e6c9", color: "#9e9e9e" },
            }}
          >
            הוסף קרן
          </Button>
                    <Button onClick={onClose} sx={{ color: "#2a8c82" }}>
            ביטול
          </Button>
        </DialogActions>
      </Dialog>
          </RtlThemeProvider>
  )
}

export default AddFundModal