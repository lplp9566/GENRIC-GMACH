import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

const stats = [
  { label: 'סך ההפקדות', value: '₪245,000', color: '#28a745' },
  { label: 'סך ההלוואות הפעילות', value: '₪89,000', color: '#dc3545' },
  { label: 'יתרת מאזן', value: '₪156,000', color: '#17a2b8' },
  { label: 'משתמשים פעילים', value: '17', color: '#B8860B' },
];

const HomePage = () => {
  return (
    <Box sx={{ p: 3, direction: 'rtl', backgroundColor: '#F9F9F9' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        ברוכים הבאים למערכת הגמ"ח המשפחתי
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} md={3} key={stat.label}>
            <Card sx={{ borderRight: `5px solid ${stat.color}` }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          פעולות אחרונות:
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography>15/05/2025 | תשלום חודשי - יעקב כהן | ₪400-</Typography>
              <Typography>14/05/2025 | תרומה - רות פרידמן | ₪1,000+</Typography>
              <Typography>13/05/2025 | פתיחת הלוואה - אשר פסיקוב | ₪5,000-</Typography>
              <Typography>12/05/2025 | סיום פיקדון - נחמן ברגר | ₪3,000+</Typography>
              <Typography>10/05/2025 | תשלום חודשי - דב רבינוביץ | ₪350-</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="success" endIcon={<ArrowForward />}>
          הלוואה חדשה
        </Button>
        <Button variant="contained" color="primary" endIcon={<ArrowForward />}>
          תרומה חדשה
        </Button>
        <Button variant="contained" color="warning" endIcon={<ArrowForward />}>
          הפקדה חדשה
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
