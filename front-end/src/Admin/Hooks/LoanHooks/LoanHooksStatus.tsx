import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const useLoanHelpers = () => {
  const getStatusColor = (isActive: boolean, remainingBalance: number) => {
    if (!isActive && remainingBalance === 0) {
      return '#4CAF50';
    } else if (!isActive && remainingBalance > 0) {
      return '#FF9800';
    } else if (isActive && remainingBalance > 0) {
      return '#2196F3';
    }
    return '#616161';
  };

  const getStatusText = (isActive: boolean, remainingBalance: number) => {
    if (!isActive && remainingBalance === 0) {
      return 'שולמה';
    } else if (!isActive && remainingBalance > 0) {
      return 'בוטלה (יתרה קיימת)';
    } else if (isActive && remainingBalance > 0) {
      return 'פעילה';
    }
    return 'לא ידוע';
  };

  const getStatusIcon = (isActive: boolean, remainingBalance: number) => {
    if (!isActive && remainingBalance === 0) {
      return <DoneAllIcon sx={{ color: '#4CAF50' }} fontSize="small" />;
    } else if (!isActive && remainingBalance > 0) {
      return <ErrorOutlineIcon sx={{ color: '#FF9800' }} fontSize="small" />;
    } else if (isActive && remainingBalance > 0) {
      return <CheckCircleOutlineIcon sx={{ color: '#2196F3' }} fontSize="small" />;
    }
    return null;
  };

  return { getStatusColor, getStatusText, getStatusIcon };
};
