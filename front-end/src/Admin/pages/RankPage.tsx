import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HistoryEntry {
  amount: number;
  date: string;
  method?: string;
  notes?: string;
}
interface Rank {
  id: number;
  name: string;
  history: HistoryEntry[];
}

const palette = {
  background: '#f5ebdd',
  cardBg: '#ffffff',
  lightBg: '#e6f9ec',
  primaryText: '#2e2e2e',
  titleText: '#1c3c3c',
  button: '#2a8c82',
  fieldBorder: '#2a8c82',
};

const RanksManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [ranks, setRanks] = useState<Rank[]>([
    { id: 1, name: 'דרגה א', history: [{ amount: 100, date: '2025-01-01' }] },
    { id: 2, name: 'דרגה ב', history: [{ amount: 200, date: '2025-02-15' }] },
    { id: 3, name: 'דרגה ג', history: [] },
  ]);

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const [selectedRankId, setSelectedRankId] = useState<number | ''>('');

  // Form fields
  const [newName, setNewName] = useState('');
  const [amount, setAmount] = useState('0');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Handlers
  const handleAddOpen = () => setOpenAdd(true);
  const handleManageOpen = (id?: number) => {
    if (id) setSelectedRankId(id);
    setOpenManage(true);
  };
  const resetForm = () => {
    setNewName('');
    setSelectedRankId('');
  };
  const handleAdd = () => {
    setRanks([...ranks, { id: ranks.length+1, name: newName, history: [] }]);
    resetForm();
    setOpenAdd(false);
  };
  const handleSave = () => {
    setRanks(ranks.map(r => {
      if (r.id === selectedRankId) {
        const newEntry: HistoryEntry = { amount: Number(amount), date, method, notes };
        return { ...r, history: [...r.history, newEntry] };
      }
      return r;
    }));
    resetForm();
    setOpenManage(false);
  };

  return (
    <Box p={3} bgcolor={palette.background} minHeight="100vh">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" sx={{ color: palette.titleText, mr:1 }}>ניהול דרגות</Typography>
          <SettingsIcon sx={{ color: palette.titleText }} />
        </Box>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ color: palette.button, borderColor: palette.button }}
        >חזרה</Button>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={3} mb={4}>
        {[{
          title: 'הוספת דרגה חדשה', icon: <AddIcon />, onClick: handleAddOpen
        },{
          title: 'ניהול דרגות', icon: <EditIcon />, onClick: () => handleManageOpen()
        }].map((card,i)=>(
          <Grid key={i} item xs={12} md={6}>
            <Card sx={{ bgcolor: palette.lightBg, cursor:'pointer' }} onClick={card.onClick}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  {card.icon}
                  <Typography variant="h6" sx={{ ml:1, color: palette.primaryText }}>{card.title}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ranks List */}
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <HistoryIcon sx={{ color: palette.primaryText, mr:1 }} />
          <Typography variant="h6" sx={{ color: palette.primaryText }}>דרגות במערכת</Typography>
        </Box>
        {ranks.map(rank => {
          const latest = rank.history[rank.history.length-1];
          return (
            <Accordion key={rank.id} sx={{ mb:1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow:1, color: palette.primaryText }}>{rank.name}</Typography>
                <Typography sx={{ color: palette.primaryText }}>
                  {latest ? `${latest.amount} ₪` : '0 ₪'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor:'#fafafa' }}>
                {rank.history.length ? (
                  <List>
                    {rank.history.map((h,i)=>(
                      <React.Fragment key={i}>
                        <ListItem>
                          <Box>
                            <Typography>סכום: {h.amount} ₪</Typography>
                            <Typography>תאריך: {h.date}</Typography>
                            {h.method && <Typography>אמצעי: {h.method}</Typography>}
                            {h.notes && <Typography>הערות: {h.notes}</Typography>}
                          </Box>
                        </ListItem>
                        {i < rank.history.length-1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography sx={{ color: palette.primaryText }}>אין היסטוריה</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={()=>{resetForm();setOpenAdd(false);}} PaperComponent={props=><Paper {...props} sx={{borderRadius:8}}/>} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: palette.button, color:'#fff', py:2, textAlign:'center' }}>
          הוספת דרגה חדשה
          <IconButton sx={{ color:'#fff', position:'absolute', top:8, right:8 }} onClick={()=>{resetForm();setOpenAdd(false);}}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: palette.lightBg, py:3, px:4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="שם דרגה *"
            placeholder="הכנס שם דרגה..."
            value={newName}
            onChange={e=>setNewName(e.target.value)}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.fieldBorder },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.fieldBorder },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: palette.fieldBorder },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px:4, py:2, bgcolor:'#fff' }}>
          <Button onClick={()=>{resetForm();setOpenAdd(false);}} sx={{ color: palette.button }}>ביטול</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!newName.trim()} sx={{ bgcolor:palette.button }}>
            הוסף דרגה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Dialog */}
      <Dialog open={openManage} onClose={()=>{resetForm();setOpenManage(false);}} PaperComponent={props=><Paper {...props} sx={{borderRadius:8}}/>} fullWidth maxWidth="sm">
        <DialogTitle sx={{ bgcolor: palette.button, color:'#fff', py:2, textAlign:'center' }}>
          ניהול דרגה
          <IconButton sx={{ color:'#fff', position:'absolute', top:8, right:8 }} onClick={()=>{resetForm();setOpenManage(false);}}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: palette.lightBg, py:3, px:4 }}>
          <FormControl fullWidth sx={{ mb:2 }}>
            <InputLabel id="manage-rank-label">בחר דרגה *</InputLabel>
            <Select
              labelId="manage-rank-label"
              value={selectedRankId}
              label="בחר דרגה"
              onChange={e=>setSelectedRankId(e.target.value as number)}
              sx={{ '& .MuiOutlinedInput-notchedOutline':{borderColor:palette.fieldBorder} }}
            >{ranks.map(r=><MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth type="number" label="סכום (₪) *" value={amount} onChange={e=>setAmount(e.target.value)} sx={{ mb:2 }} InputProps={{ sx:{ '& .MuiOutlinedInput-notchedOutline':{borderColor:palette.fieldBorder} } }} />
          <TextField fullWidth type="date" label="תאריך *" value={date} onChange={e=>setDate(e.target.value)} InputLabelProps={{ shrink:true }} sx={{ mb:2 }} InputProps={{ sx:{ '& .MuiOutlinedInput-notchedOutline':{borderColor:palette.fieldBorder} } }} />
        </DialogContent>
        <DialogActions sx={{ px:4, py:2, bgcolor:'#fff' }}>
          <Button onClick={()=>{resetForm();setOpenManage(false);}} sx={{ color: palette.button }}>ביטול</Button>
          <Button onClick={handleSave} variant="contained" disabled={!selectedRankId} sx={{ bgcolor:palette.button }}>שמירה</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RanksManagementPage;
