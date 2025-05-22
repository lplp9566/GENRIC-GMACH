import { Box, Typography } from '@mui/material'
import React from 'react'
interface Props {
    errorMessage: string
}
const ErrorMessage: React.FC<Props> = ({errorMessage}) => {
  return (
    <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="80vh"
    bgcolor="background.default"
    color="error.main"
    dir="rtl"
  >
    <Typography variant="h6">
      שגיאה בטעינת הנתונים: {errorMessage || "נסה שוב מאוחר יותר."}
    </Typography>
  </Box>
  )
}

export default ErrorMessage