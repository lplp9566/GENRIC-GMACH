import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import {
  getRegulation,
  UpdateRegulation,
} from '../../store/features/admin/adminFundsOverviewSlice';

const convertToPreviewLink = (url: string): string => {
  if (!url) return '';
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  return match?.[1]
    ? `https://drive.google.com/file/d/${match[1]}/preview`
    : url;
};

const GemachRegulationsModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [editedUrl, setEditedUrl] = useState('');
  const [tab, setTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();

  const regulationArray = useSelector(
    (state: RootState) => state.adminFundsOverviewReducer.regulation
  );

  const regulationUrl = regulationArray?.[0]?.regulation || '';
  const previewUrl = convertToPreviewLink(regulationUrl);

  useEffect(() => {
    if (open) {
      dispatch(getRegulation());
    }
  }, [open]);

  useEffect(() => {
    if (editing && regulationUrl) {
      setEditedUrl(regulationUrl);
    }
  }, [editing, regulationUrl]);

  const handleSave = () => {
    dispatch(UpdateRegulation({ regulation: editedUrl }));
    setEditing(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen={isMobile} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
      
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          תקנון גמח אהבת חסד
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: '#fafafa', px: 4, py: 3 }}>
        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          {editing && (
            <TextField
            sx={{marginTop:5}}
              fullWidth
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              label="כתובת Google Drive"
              size="small"
              variant="outlined"
            />
          )}

          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap" >
            {editing && (
              <Button variant="contained" color="success" onClick={handleSave}>
                שמור
              </Button>
            )}

            <Button
              startIcon={editing ? <CloseIcon /> : <EditIcon />}
              onClick={() => setEditing(!editing)}
              color={editing ? 'secondary' : 'primary'}
              variant="outlined"
            >
              {editing ? 'ביטול' : 'עריכה'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Tabs value={tab} onChange={(_, val) => setTab(val)} centered sx={{ mb: 2 }}>
          <Tab label="צפייה בתקנון" />
        </Tabs>

        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%',
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          {previewUrl && (
            <Box
              component="iframe"
              src={previewUrl}
              title="PDF Viewer"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GemachRegulationsModal;
