import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

export const NewLoan = () => {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1E3A3A' }}>
        יצירת הלוואה חדשה
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="שם הלווה" variant="outlined" />
        <TextField label="סכום ההלוואה" type="number" variant="outlined" />
        <TextField label="תאריך התחלה" type="date" InputLabelProps={{ shrink: true }} />
        <Button variant="contained" sx={{ backgroundColor: '#1E3A3A', color: '#fff' }}>
          שמור
        </Button>
      </Box>
    </Paper>
  );
};
