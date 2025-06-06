// HomePage.tsx
import React from 'react';
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
  { label: 'סך ההפקדות', value: '₪245,000', color: 'success.main' },
  { label: 'סך ההלוואות הפעילות', value: '₪89,000', color: 'danger.main' },
  { label: 'יתרת מאזן', value: '₪156,000', color: 'info.main' },
  { label: 'משתמשים פעילים', value: '17', color: 'warning.main' },
];

const recentActivities = [
  { date: '15/05/2025', description: 'תשלום חודשי - יעקב כהן', amount: '₪400-', type: 'expense' },
  { date: '14/05/2025', description: 'תרומה - רות פרידמן', amount: '₪1,000+', type: 'income' },
  { date: '13/05/2025', description: 'פתיחת הלוואה - אשר פסיקוב', amount: '₪5,000-', type: 'expense' },
  { date: '12/05/2025', description: 'סיום פיקדון - נחמן ברגר', amount: '₪3,000+', type: 'income' },
  { date: '10/05/2025', description: 'תשלום חודשי - דב רבינוביץ', amount: '₪350-', type: 'expense' },
];

const HomePage: React.FC = () => (
  <Box
    p={4}
    bgcolor="background.default"
    minHeight="calc(100vh - 64px)"
    overflow="auto"
  >
    <Typography variant="h4">ברוכים הבאים למערכת הגמ"ח</Typography>

    <Grid container spacing={4} mb={6}>
      {stats.map((stat) => (
        <Grid item xs={12} md={3} key={stat.label}>
          <Card sx={{ borderRight: `6px solid`, borderColor: stat.color, p: 1 }}>
            <CardContent>
              <Typography variant="subtitle1">{stat.label}</Typography>
              <Typography variant="h5">{stat.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <Typography variant="h5" gutterBottom> פעולות אחרונות</Typography>
    <Card>
      <CardContent>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {recentActivities.map((act, i) => (
            <Typography key={i}>
              <Box component="span" color="text.secondary" mr={1}>
                {act.date} |
              </Box>
              {act.description} :
              <Box
                component="strong"
                color={act.type === 'income' ? 'success.main' : 'danger.main'}
                ml={1}
                display="inline-block"
                textAlign="left"
                minWidth={70}
              >
                {act.amount}
              </Box>
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>

    <Box display="flex" gap={3} flexWrap="wrap" mt={4}>
      <Button variant="contained" color="primary" endIcon={<ArrowForward />}>
        הלוואה חדשה
      </Button>
      <Button variant="contained" color="success" endIcon={<ArrowForward />}>
        תרומה חדשה
      </Button>
      <Button variant="contained" color="info" endIcon={<ArrowForward />}>
        פיקדון חדש
      </Button>
    </Box>
  </Box>
);

export default HomePage;
