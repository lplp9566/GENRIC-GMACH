import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  year: number;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [form, setForm] = useState({ description: '', amount: '', date: '', year: '' });

  useEffect(() => {
    axios.get('http://localhost:3000/expenses')
      .then(res => setExpenses(res.data))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(expenses.map(e => e.year)));
  const filteredExpenses = filterYear === 'all' ? expenses : expenses.filter(e => String(e.year) === filterYear);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name!]: value }));
  };

  const handleAddExpense = () => {
    // Placeholder: send to backend
    const newExpense: Expense = {
      id: Date.now(),
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      year: Number(form.year),
    };
    setExpenses(prev => [newExpense, ...prev]);
    setOpen(false);
    setForm({ description: '', amount: '', date: '', year: '' });
  };

  return (
    <Container
      sx={{
        py: 4,
        direction: 'rtl',
        bgcolor: '#F9FBFC',
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, bgcolor: '#fff', p: 3, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h5" fontWeight={700}>ניהול הוצאות</Typography>
        <Box display="flex" gap={2}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#2a8c82', color: '#fff' }} onClick={handleOpen}>
            הוסף הוצאה
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="year-filter-label">שנה</InputLabel>
            <Select
              labelId="year-filter-label"
              value={filterYear}
              label="שנה"
              onChange={e => setFilterYear(e.target.value as string)}
            >
              <MenuItem value="all">הכל</MenuItem>
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Add Expense Modal */}
      <Dialog open={open} onClose={handleClose} dir="rtl">
        <DialogTitle>הוסף הוצאה חדשה</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <TextField label="תיאור" name="description" value={form.description} onChange={handleFormChange} fullWidth />
          <TextField label="סכום" name="amount" type="number" value={form.amount} onChange={handleFormChange} fullWidth />
          <TextField label="תאריך" name="date" type="date" value={form.date} onChange={handleFormChange} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="שנה" name="year" type="number" value={form.year} onChange={handleFormChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>ביטול</Button>
          <Button onClick={handleAddExpense} variant="contained" sx={{ bgcolor: '#2a8c82', color: '#fff' }}>הוסף</Button>
        </DialogActions>
      </Dialog>

      {/* Expenses Table */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1, p: 3 }}>
        <Typography variant="h6" mb={2}>רשימת הוצאות</Typography>
        <Table>
          <TableHead sx={{ background: '#e8eef3' }}>
            <TableRow>
              <TableCell>תיאור</TableCell>
              <TableCell>סכום</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell>שנה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center">טוען...</TableCell></TableRow>
            ) : filteredExpenses.length > 0 ? (
              filteredExpenses.map(exp => (
                <TableRow key={exp.id}>
                  <TableCell>{exp.description}</TableCell>
                  <TableCell>{exp.amount.toLocaleString()} ₪</TableCell>
                  <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                  <TableCell>{exp.year}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} align="center">לא נמצאו הוצאות</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default ExpensesPage; 