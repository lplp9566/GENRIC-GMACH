import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  Divider,
  Container,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import RankHeader from '../components/ranks/RankHeader';

type HistoryEntry = { amount: number; date: string; method?: string; notes?: string };
interface Rank { id: number; name: string; history: HistoryEntry[] }

const RanksManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [ranks, setRanks] = useState<Rank[]>([
    { id: 1, name: 'דרגה א', history: [{ amount: 100, date: '2025-01-01' }] },
    { id: 2, name: 'דרגה ב', history: [{ amount: 200, date: '2025-02-15' }] },
    { id: 3, name: 'דרגה ג', history: [] },
  ]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [selectedRankId, setSelectedRankId] = useState<number | ''>('');
  const [newName, setNewName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setNewName('');
    setSelectedRankId('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setMethod('');
    setNotes('');
  };

  const handleAddOpen = () => setOpenAdd(true);
  const handleManageOpen = (id?: number) => {
    if (id) setSelectedRankId(id);
    setOpenManage(true);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    setRanks([...ranks, { id: ranks.length + 1, name: newName, history: [] }]);
    resetForm();
    setOpenAdd(false);
  };

  const handleSave = () => {
    if (!selectedRankId) return;
    setRanks(ranks.map(r =>
      r.id === selectedRankId
        ? { ...r, history: [...r.history, { amount: Number(amount), date, method, notes }] }
        : r
    ));
    resetForm();
    setOpenManage(false);
  };

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC", 
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >   
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Button
              // startIcon={<ArrowForwardIcon />}
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{ color: '#2a8c82', borderColor: '#2a8c82' }}
            >{`${" <"} ${"חזרה"}`}</Button>
            <RankHeader  />
          </Box> 

          {/* Action Cards */}
          {/* Ranks List */}
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <HistoryIcon sx={{ color: '#2e2e2e', mr: 1 }} />
              <Typography variant="h6" color="#2e2e2e" textAlign="right">דרגות במערכת</Typography>
            </Box>
            {ranks.map(rank => {
              const latest = rank.history[rank.history.length - 1];
              return (
                <Accordion key={rank.id} sx={{ mb: 1, borderRadius: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Typography color="#2e2e2e" textAlign="right">{rank.name}</Typography>
                      <Typography color="#2e2e2e" textAlign="right">
                        {latest ? `${latest.amount} ₪` : '0 ₪'}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#fafafa', p: 2 }}>
                    {rank.history.length ? (
                      <List>
                        {rank.history.map((h, i) => (
                          <React.Fragment key={i}>
                            <ListItem>
                              <Box>
                                <Typography textAlign="right">סכום: {h.amount} ₪</Typography>
                                <Typography textAlign="right">תאריך: {h.date}</Typography>
                                {h.method && <Typography textAlign="right">אמצעי: {h.method}</Typography>}
                                {h.notes && <Typography textAlign="right">הערות: {h.notes}</Typography>}
                              </Box>
                            </ListItem>
                            {i < rank.history.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography color="#2e2e2e" textAlign="right">אין היסטוריה</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          {/* Add Dialog */}
          <Dialog
            open={openAdd}
            onClose={() => { resetForm(); setOpenAdd(false); }}
            dir="rtl"
            fullWidth
            maxWidth="sm"
            PaperComponent={props => <Paper {...props} sx={{ borderRadius: 4 }} />}
          >
            <DialogTitle
              sx={{ bgcolor: '#2a8c82', color: '#fff', py: 2, textAlign: 'center', position: 'relative' }}
            >
              הוספת דרגה חדשה
              <IconButton
                sx={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}
                onClick={() => { resetForm(); setOpenAdd(false); }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#e6f9ec', py: 4, px: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="שם דרגה *"
                placeholder="הכנס שם דרגה..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                InputLabelProps={{ sx: { textAlign: 'right', right: 0, left: 'auto', transformOrigin: 'top right' } }}
                InputProps={{ sx: { '& input': { textAlign: 'right' } } }}
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 2, bgcolor: '#fff' }}>
              <Button onClick={() => { resetForm(); setOpenAdd(false); }} sx={{ color: '#2a8c82' }}>
                ביטול
              </Button>
              <Button onClick={handleAdd} variant="contained" disabled={!newName.trim()} sx={{ bgcolor: '#2a8c82' }}>
                הוסף דרגה
              </Button>
            </DialogActions>
          </Dialog>

          {/* Manage Dialog */}
          <Dialog
            open={openManage}
            onClose={() => { resetForm(); setOpenManage(false); }}
            dir="rtl"
            fullWidth
            maxWidth="sm"
            PaperComponent={props => <Paper {...props} sx={{ borderRadius: 4 }} />}
          >
            <DialogTitle
              sx={{ bgcolor: '#2a8c82', color: '#fff', py: 2, textAlign: 'center', position: 'relative' }}
            >
              ניהול דרגה
              <IconButton
                sx={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}
                onClick={() => { resetForm(); setOpenManage(false); }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: '#e6f9ec', py: 4, px: 4 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel
                  id="manage-rank-label"
                  sx={{ textAlign: 'right', right: 0, left: 'auto', transformOrigin: 'top right' }}
                >בחר דרגה *</InputLabel>
                <Select
                  labelId="manage-rank-label"
                  value={selectedRankId}
                  onChange={e => setSelectedRankId(e.target.value as number)}
                  sx={{ '.MuiOutlinedInput-notchedOutline legend': { left: 'auto', right: 8, transform: 'translate(8px, -6px)' },
                       '& .MuiSelect-outlined': { textAlign: 'right' } }}
                >
                  {ranks.map(r => <MenuItem key={r.id} value={r.id} sx={{ textAlign: 'right' }}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="number"
                label="סכום (₪) *"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                InputLabelProps={{ sx: { textAlign: 'right', right: 0, left: 'auto', transformOrigin: 'top right' } }}
                InputProps={{ sx: { '& input': { textAlign: 'right' } } }}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                type="date"
                label="תאריך *"
                value={date}
                onChange={e => setDate(e.target.value)}
                InputLabelProps={{ shrink: true, sx: { textAlign: 'right', right: 0, left: 'auto', transformOrigin: 'top right' } }}
                InputProps={{ sx: { '& input': { textAlign: 'right' } } }}
                sx={{ mb: 3 }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 4, py: 2, bgcolor: '#fff' }}>
              <Button onClick={() => { resetForm(); setOpenManage(false); }} sx={{ color: '#2a8c82' }}>
                ביטול
              </Button>
              <Button onClick={handleSave} variant="contained" disabled={!selectedRankId || !amount || !date} sx={{ bgcolor: '#2a8c82' }}>
                שמירה
              </Button>
            </DialogActions>
          </Dialog>

        </Container>);
};

export default RanksManagementPage;
