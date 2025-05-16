import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Paper } from '@mui/material';

export const LoanDetails = () => {
  const { id } = useParams();

  // בעתיד אפשר למשוך מפורש את ההלוואה לפי ID
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#1E3A3A' }}>
        פרטי הלוואה #{id}
      </Typography>
      <Typography>לווה: משה כהן</Typography>
      <Typography>סכום: ₪12,000</Typography>
      <Typography>סטטוס: פעילה</Typography>
      <Typography>תאריך התחלה: 01/01/2024</Typography>
      <Typography>יתרה: ₪6,000</Typography>
    </Paper>
  );
};
