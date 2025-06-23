// src/components/AddPaymentModal.tsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, TextField, FormControl,
  InputLabel, Select, MenuItem, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { setMonthlyPaymentModalMode } from '../../../store/features/Main/AppMode';
import { paymentMethod } from '../MunthlyPaymentsDto';
import SelectAllUsers from '../../SelectUsers/SelectAllUsers';

export const AddPaymentModal: React.FC = () => {
  const dispatch = useDispatch();
  const open = useSelector((s: RootState) => s.mapModeSlice.MonthlyPaymentModalMode);

  // initialize with today’s date
  const today = new Date().toISOString().slice(0, 10);

  // single piece of form state
  const [newPayment, setNewPayment] = useState({
    userId: 0,
    amount: 0,
    depositDate: today,
    method: paymentMethod[0].value,
    description: ''
  });

  // reset form when modal opens
//   useEffect(() => {
//     if (open) {
//       setNewPayment({
//         userId: 0,
//         amount: 0,
//         depositDate: today,
//         method: paymentMethod[0].value,
//         description: ''
//       });
//     }
//   }, [open, today]);

  const handleClose = () => {
    dispatch(setMonthlyPaymentModalMode(false));
    console.log(newPayment)
  };

  const handleSubmit = () => {
    // dispatch create action
    // dispatch(createMonthlyPayment({
    //   user: newPayment.userId as number,
    //   amount: newPayment.amount,
    //   deposit_date: newPayment.depositDate,
    //   payment_method: newPayment.method,
    //   description: newPayment.description
    // }));
    handleClose();
  };

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pr: 1 }}>
        הוספת תשלום חדש
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, left: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ px: 3, mb: 2 }}
      >
        הזן את פרטי התשלום החדש
      </Typography>

      <DialogContent
        sx={{
          px: 3,
          pt: 0,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Select User */}
        <SelectAllUsers
        //   value={newPayment.userId}
          onChange={id => setNewPayment(p => ({ ...p, userId: id }))}
            label="בחר משתמש"
            value={newPayment.userId }
        />

        {/* Amount */}
        <TextField
          label="סכום (₪)"
          size="small"
          fullWidth
          value={newPayment.amount}
          onChange={e => setNewPayment(p => ({ ...p, amount: +e.target.value }))}
        />

        {/* Date */}
        <TextField
          label="תאריך"
          type="date"
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={newPayment.depositDate}
          onChange={e => setNewPayment(p => ({ ...p, depositDate: e.target.value }))}
        />

        {/* Payment Method */}
        <FormControl fullWidth size="small">
          <InputLabel id="method-label">אמצעי תשלום</InputLabel>
          <Select
            labelId="method-label"
            value={newPayment.method}
            label="אמצעי תשלום"
            onChange={e => setNewPayment(p => ({ ...p, method: e.target.value }))}
          >
            {paymentMethod.map(pm => (
              <MenuItem key={pm.value} value={pm.value}>
                {pm.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Description */}
        <TextField
          label="הערות (אופציונלי)"
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={newPayment.description}
          onChange={e => setNewPayment(p => ({ ...p, description: e.target.value }))}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>ביטול</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !newPayment.userId ||
            newPayment.amount <= 0 ||
            !newPayment.method
          }
          sx={{
            bgcolor: '#2e7d32',
            color: '#fff',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          הוספת תשלום
        </Button>
      </DialogActions>
    </Dialog>
  );
};
