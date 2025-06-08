import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Fade,
  MenuItem,
  FormControlLabel,
  Checkbox,
  createTheme, // Import createTheme
  ThemeProvider, // Import ThemeProvider
  CssBaseline, // Import CssBaseline for consistent styling
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { IAddUserFormData, IFormPaymentData, IFormUserData,  payment_method, UserRole } from './UsersDto';

// Import the interfaces and enums

// 1. הגדרת Theme מותאם אישית
const theme = createTheme({
  direction: 'rtl', // הגדרת כיוון RTL גלובלית
  palette: {
    primary: {
      main: '#42a5f5', // כחול בהיר ומרענן
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ab47bc', // סגול עדין
      light: '#ce93d8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    background: {
      default: '#e3f2fd', // רקע בהיר מאוד לכחול
      paper: '#ffffff',
    },
    text: {
      primary: '#37474f', // טקסט כהה לאפור-כחול
      secondary: '#546e7a', // טקסט משני מעט בהיר יותר
    },
  },
  typography: {
    fontFamily: 'Heebo, Arial, sans-serif', // לדוגמה, גופן עברי נפוץ
    h4: {
      fontWeight: 700, // כותרות בולטות יותר
      color: '#263238',
    },
    h6: {
      fontWeight: 600,
      color: '#455a64',
    },
    button: {
      textTransform: 'none', // כפתורים ללא אותיות גדולות
      fontWeight: 600,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px', // פינות מעוגלות יותר לשדות קלט
            '&.Mui-focused fieldset': {
              borderColor: '#42a5f5', // צבע גבול בפוקוס
              borderWidth: '2px', // גבול עבה יותר בפוקוס
            },
          },
          '& .MuiInputLabel-root': {
            right: 20, // יישור תווית לימין (RTL)
            left: 'unset',
            transformOrigin: 'right', // יישור אנימציית התווית
            '&.Mui-focused': {
              color: '#42a5f5', // צבע תווית בפוקוס
            },
          },
          '& .MuiInputLabel-shrink': {
            transformOrigin: 'right', // יישור אנימציית התווית כשהיא מצומצמת
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // פינות מעוגלות לכפתורים
          padding: '14px 24px', // ריווח פנימי גדול יותר
          fontSize: '1.1rem',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', // צל עדין
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)', // אפקט ריחוף
            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px', // פינות מעוגלות יותר לכרטיס (Paper)
          boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.08)', // צל גדול ועדין יותר
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        positionStart: {
          marginRight: '12px', // מרווח מהאייקון לטקסט
          marginLeft: 0, // ביטול מרווחים מיותרים משמאל ב-RTL
        },
      },
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                direction: 'rtl', // Ensure alert direction is RTL
                textAlign: 'right',
            },
            icon: {
                marginRight: '12px', // Adjust icon margin for RTL
                marginLeft: 0,
            },
            message: {
                marginRight: 0, // Adjust message margin for RTL
                marginLeft: 'auto',
            }
        }
    }
  },
});

const AddUserPage: React.FC = () => {
  const [formData, setFormData] = useState<IAddUserFormData>({
    userData: {
      first_name: '',
      last_name: '',
      id_number: '',
      password: '',
      confirmPassword: '',
      phone_number: '',
      email: '',
      role: UserRole.member,
      iS_admin: false,
      join_date: new Date(),
    },
    paymentData: {
      bank_number: 0,
      bank_branch: 0,
      bank_account_number: 0,
      charge_date: '',
      payment_method: payment_method.cash,
    }
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (Object.keys(formData.userData).includes(name as keyof IFormUserData)) {
      setFormData((prevData) => ({
        ...prevData,
        userData: {
          ...prevData.userData,
          [name as keyof IFormUserData]: value,
        },
      }));
    } else if (Object.keys(formData.paymentData).includes(name as keyof IFormPaymentData)) {
      setFormData((prevData) => ({
        ...prevData,
        paymentData: {
          ...prevData.paymentData,
          [name as keyof IFormPaymentData]: (name === 'bank_number' || name === 'bank_branch' || name === 'bank_account_number' || name === 'charge_date')
            ? (value === '' ? undefined : Number(value)) // Convert to number or undefined
            : value,
        },
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      userData: {
        ...prevData.userData,
        [name as keyof IFormUserData]: checked,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

  }
//   const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setSnackbarOpen(false);
//   };

  return (
    <ThemeProvider theme={theme}> {/* עוטף את כל הקומפוננטה ב-ThemeProvider */}
      <CssBaseline /> {/* מספק CSS בסיסי לעקביות */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default, // שימוש בצבע רקע מה-theme
          p: 3,
          // direction: 'rtl', // ניתן להגדיר כאן, אך עדיף ב-theme גלובלי
        }}
      >
        <Fade in={true} timeout={3000}>
          <Paper
            elevation={6} // ניתן לוותר על זה ולהסתמך על ה-boxShadow ב-theme
            sx={{
              p: { xs: 3, md: 5 },
              maxWidth: 800,
              width: '100%',
              backgroundColor: theme.palette.background.paper, // שימוש בצבע נייר מה-theme
              //boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // הועבר ל-theme
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PersonAddIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                הוספת משתמש חדש
              </Typography>
              <Typography variant="body1" color="text.secondary">
                אנא מלא את הפרטים הבאים כדי ליצור חשבון חדש.
              </Typography>
            </Box>

            <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} /> {/* צבע חוצץ */}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                פרטי משתמש
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="שם פרטי"
                    name="first_name"
                    value={formData.userData.first_name}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<AccountCircle color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="שם משפחה"
                    name="last_name"
                    value={formData.userData.last_name}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<AccountCircle color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="מספר תעודת זהות"
                    name="id_number"
                    value={formData.userData.id_number}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    inputProps={{ maxLength: 9 }}
                    InputProps={{
                      startAdornment: (<AssignmentIndIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="כתובת אימייל"
                    name="email"
                    type="email"
                    value={formData.userData.email}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<EmailIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="מספר טלפון"
                    name="phone_number"
                    type="tel"
                    value={formData.userData.phone_number}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<PhoneIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="סיסמה"
                    name="password"
                    type="password"
                    value={formData.userData.password}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<LockIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="אימות סיסמה"
                    name="confirmPassword"
                    type="password"
                    value={formData.userData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<LockIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="תפקיד"
                    name="role"
                    value={formData.userData.role}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: (<SecurityIcon color="action" />),
                    }}
                  >
                    {Object.values(UserRole).map((role) => (
                      <MenuItem key={role as string} value={role as string} component="li">
                        {role === UserRole.member && 'חבר'}
                        {role === UserRole.committeeMember && 'חבר ועדה'}
                        {role === UserRole.president && 'נשיא'}
                        {role === UserRole.admin && 'מנהל'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.userData.iS_admin}
                        onChange={handleCheckboxChange}
                        name="iS_admin"
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsIcon color="action" fontSize="small" /> האם מנהל?
                      </Box>
                    }
                    sx={{
                      mr: 1,
                      mt: 1,
                      // For RTL, checkbox should be on the right
                      '& .MuiCheckbox-root': {
                        marginRight: 'auto', // Push checkbox to right
                        marginLeft: '8px',
                      },
                      '& .MuiFormControlLabel-label': {
                        marginRight: 'unset', // Reset default margin
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                פרטי תשלום (אופציונלי)
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="מספר בנק"
                    name="bank_number"
                    type="number"
                    value={formData.paymentData.bank_number === undefined ? '' : formData.paymentData.bank_number}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (<CreditCardIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="מספר סניף"
                    name="bank_branch"
                    type="number"
                    value={formData.paymentData.bank_branch === undefined ? '' : formData.paymentData.bank_branch}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (<LocationOnIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="מספר חשבון בנק"
                    name="bank_account_number"
                    type="number"
                    value={formData.paymentData.bank_account_number === undefined ? '' : formData.paymentData.bank_account_number}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (<CreditCardIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="יום חיוב (1-31)"
                    name="charge_date"
                    type="number"
                    value={formData.paymentData.charge_date || ''}
                    onChange={handleChange}
                    variant="outlined"
                    inputProps={{ min: 1, max: 31 }}
                    InputProps={{
                      startAdornment: (<EventIcon color="action" />),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="שיטת תשלום"
                    name="payment_method"
                    value={formData.paymentData.payment_method || ''}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (<CreditCardIcon color="action" />),
                    }}
                  >
                    <MenuItem value="" component="li">בחר שיטה</MenuItem>
                    {Object.values(payment_method).map((method) => (
                      <MenuItem key={method as string} value={method as string} component="li">
                        {method === payment_method.direct_debit && 'הוראת קבע'}
                        {method === payment_method.credit_card && 'כרטיס אשראי'}
                        {method === payment_method.bank_transfer && 'העברה בנקאית'}
                        {method === payment_method.cash && 'מזומן'}
                        {method === payment_method.outer && 'חיצוני'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  sx={{ mt: 4 }} // Styles for button are now in theme
                >
                  הוסף משתמש
                </Button>
              </Grid>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </ThemeProvider>
  );
};

export default AddUserPage;