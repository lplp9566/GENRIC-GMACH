import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { mockUsers, User } from './MookUsrs';

const UsersPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user: User) => {
      const fullName = `${user.first_name} ${user.last_name}`;
      const matchesSearch =
        fullName.includes(searchValue) ||
        user.id_number.includes(searchValue) ||
        user.email_address.includes(searchValue);
      if (!matchesSearch) return false;
      if (roleFilter !== 'all' && user.current_role !== Number(roleFilter)) return false;
      if (adminFilter === 'yes' && !user.is_admin) return false;
      if (adminFilter === 'no' && user.is_admin) return false;
      return true;
    });
  }, [searchValue, roleFilter, adminFilter]);

  return (
    <Box p={4} sx={{ backgroundColor: '#f5ebdd', minHeight: '100vh' }}>
      {/* Toolbar */}
      <Box mb={4} display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <TextField
          label="חיפוש"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <FormControl size="small">
          <InputLabel id="role-label">דרגה</InputLabel>
          <Select
            labelId="role-label"
            value={roleFilter}
            label="דרגה"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="admin-label">Admin</InputLabel>
          <Select
            labelId="admin-label"
            value={adminFilter}
            label="Admin"
            onChange={(e) => setAdminFilter(e.target.value)}
          >
            <MenuItem value="all">הכל</MenuItem>
            <MenuItem value="yes">כן</MenuItem>
            <MenuItem value="no">לא</MenuItem>
          </Select>
        </FormControl>
        <Box flexGrow={1} />
        <Button variant="contained" sx={{ backgroundColor: '#2a8c82' }}>
          + משתמש חדש
        </Button>
      </Box>

      {/* Grid of User Cards */}
      <Grid container spacing={3}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <Card sx={{ backgroundColor: '#dceee9' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="body2">ת.ז.: {user.id_number}</Typography>
                <Typography variant="body2">הצטרף: {user.join_date}</Typography>
                <Typography variant="body2">אימייל: {user.email_address}</Typography>
                <Typography variant="body2">טלפון: {user.phone_number}</Typography>
                <Typography variant="body2">
                  מאזן חודשי: {user.payment_details.monthly_balance}
                </Typography>
                <Typography variant="body2">
                  דרגה: {user.current_role}
                </Typography>
                <Typography variant="body2">
                  Admin: {user.is_admin ? '✔️' : '✖️'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton onClick={() => console.log('View', user.id)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => console.log('Edit', user.id)}>
                  <EditIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UsersPage;
