import  { useEffect, useState } from 'react';
import { Box, Container, Card, CardContent, Typography, Grid, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

interface Donation {
  id: number;
  donor_name: string;
  amount: number;
  date: string;
  comment?: string;
  user_id?: number;
}

const DonationsPage = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with your actual API endpoint
    axios.get('http://localhost:3000/donations')
      .then(res => {
        console.log(res.data);
        setDonations(res.data);
      })
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container
      sx={{
        py: 4,
        direction: 'rtl',
        bgcolor: '#F9FBFC',
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={4} align="center">רשימת תרומות</Typography>
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          minHeight: '100vh',
          pt: 4,
          direction: 'rtl',
          borderRadius: 3,
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          mt: 4,
        }}
      >
        <Box
          sx={{
            bgcolor: '#FBFDFE',
            padding: { xs: 2, md: 3 },
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}><Typography align="center">טוען תרומות...</Typography></Grid>
            ) : donations.length > 0 ? (
              donations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} />
              ))
            ) : (
              <Grid item xs={12}><Typography align="center">לא נמצאו תרומות</Typography></Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

function DonationCard({ donation }: { donation: Donation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card sx={{ borderRadius: 3, boxShadow: 2, transition: '0.2s', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
        <CardContent onClick={() => setExpanded((prev) => !prev)}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={600}>{donation.donor_name}</Typography>
              <Typography variant="body2" color="text.secondary">{new Date(donation.date).toLocaleDateString()}</Typography>
            </Box>
            <IconButton onClick={e => { e.stopPropagation(); setExpanded((prev) => !prev); }}>
              <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">סכום: {donation.amount.toLocaleString()} ₪</Typography>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent sx={{ bgcolor: '#f5f7fa', borderTop: '1px solid #eee' }}>
            <Typography variant="subtitle2">הערה: {donation.comment || '-'}</Typography>
            <Typography variant="subtitle2">מזהה תרומה: {donation.id}</Typography>
            {donation.user_id && <Typography variant="subtitle2">מזהה משתמש: {donation.user_id}</Typography>}
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
}

export default DonationsPage; 