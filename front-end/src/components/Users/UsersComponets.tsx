import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { mockUsers, User } from './MookUsrs';

const UsersPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const todayDay = new Date().getDate().toString();

  const filteredAndSorted = useMemo(() => {
    const list = mockUsers.filter((user: User) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const val = searchValue.toLowerCase();
      const matches =
        fullName.includes(val) ||
        user.id_number.includes(val) ||
        user.email_address.toLowerCase().includes(val);
      if (!matches) return false;
      if (roleFilter !== 'all' && user.current_role !== Number(roleFilter)) return false;
      if (adminFilter === 'yes' && !user.is_admin) return false;
      if (adminFilter === 'no' && user.is_admin) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const aDue = a.payment_details.charge_date === todayDay;
      const bDue = b.payment_details.charge_date === todayDay;
      if (aDue && !bDue) return -1;
      if (!aDue && bDue) return 1;
      return 0;
    });
  }, [searchValue, roleFilter, adminFilter, todayDay]);

  return (
    <Box
      sx={{
        direction: 'rtl',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 },
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* Toolbar */}
      <Box
        mb={4}
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
        p={2}
        sx={{ backgroundColor: '#fff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', direction: 'rtl' }}
      >
        <TextField
          label="חיפוש משתמש..."
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="role-label">דרגה</InputLabel>
          <Select
            labelId="role-label"
            value={roleFilter}
            label="דרגה"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">כל הדרגות</MenuItem>
            <MenuItem value="1">דרגה 1</MenuItem>
            <MenuItem value="2">דרגה 2</MenuItem>
            <MenuItem value="3">דרגה 3</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="admin-label">מנהל</InputLabel>
          <Select
            labelId="admin-label"
            value={adminFilter}
            label="מנהל"
            onChange={(e) => setAdminFilter(e.target.value)}
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="yes">כן</MenuItem>
            <MenuItem value="no">לא</MenuItem>
          </Select>
        </FormControl>
        <Fab
          variant="extended"
          color="primary"
          onClick={() => console.log('Add New User')}
          sx={{ ml: 'auto', backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
        >
          <AddIcon sx={{ mr: 1 }} />
          משתמש חדש
        </Fab>
      </Box>

      {/* Accordion list: only names shown initially */}
      {filteredAndSorted.map((user: User) => (
        <Accordion key={user.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Typography variant="subtitle1" fontWeight={600}>
                {user.first_name} {user.last_name}
              </Typography>
              {user.payment_details.charge_date === todayDay && (
                <Chip label="חיוב היום" color="warning" size="small" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Divider sx={{ mb: 2, borderColor: '#eee' }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="body2">ת.ז.: {user.id_number}</Typography>
              <Typography variant="body2">דרגה: {user.current_role}</Typography>
              <Typography variant="body2">אימייל: {user.email_address}</Typography>
              <Typography variant="body2">טלפון: {user.phone_number}</Typography>
              <Typography variant="body2">
                מאזן חודשי: {user.payment_details.monthly_balance}₪
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => console.log('View', user.id)} color="primary">
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => console.log('Edit', user.id)} color="primary">
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {!filteredAndSorted.length && (
        <Typography textAlign="center" color="text.secondary">
          לא נמצאו משתמשים.
        </Typography>
      )}
    </Box>
  );
};

export default UsersPage;
