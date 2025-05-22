import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingIndicator = () => {
  
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
          bgcolor="background.default"
          dir="rtl"
        >
          <CircularProgress />
          <Typography variant="h6" ml={2} color="text.secondary">
            טוען נתונים...
          </Typography>
        </Box>
      );
}

export default LoadingIndicator