import React from 'react';
import { Box, Typography, AppBar, Toolbar, Button, Grid, Card, CardContent, Avatar, Stack } from '@mui/material';

const colors = {
  lightTurquoise: '#65D6D0',
  darkTurquoise: '#33B2A1',
  lightGray: '#EDEDED',
  sand: '#EAD8C9',
  red: '#E57373',
  green: '#81C784',
  orange: '#FFB74D'
};

const hasDebt = false;
const hasStandingOrderIssue = true;
const isDepositsOnTime = true;

export default function HomePage() {
  return (
    <Box>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: colors.darkTurquoise }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            גמ"ח משפחתי
          </Typography>
          <Button color="inherit">הלוואות</Button>
          <Button color="inherit">הוראת קבע</Button>
          <Button color="inherit">פיקדונות</Button>
          <Button color="inherit">תרומות</Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      {/* <Box sx={{ backgroundColor: colors.lightTurquoise, p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ברוך הבא לגמ"ח המשפחתי
        </Typography>
        <Typography variant="h6">
          ניהול הלוואות, תרומות והוראות קבע במקום אחד
        </Typography>
      </Box> */}

      {/* Financial Summary Cards */}
      <Box sx={{ backgroundColor: colors.lightGray, py: 5 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={10} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  סך הקרן
                </Typography>
                <Typography variant="h4" color="primary">
                  ₪ 150,000
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={10} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ההון העצמי
                </Typography>
                <Typography variant="h4" color="primary">
                  ₪ 90,000
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={10} md={3}>
            <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  סכום נזיל
                </Typography>
                <Typography variant="h4" color="primary">
                  ₪ 35,000
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Indicators Section */}
      <Box sx={{ backgroundColor: colors.sand, py: 4 }}>
        <Stack direction="row" justifyContent="center" spacing={6}>
          <Box textAlign="center">
            <Avatar sx={{ bgcolor: hasDebt ? colors.red : colors.green, width: 80, height: 80, fontSize: 24 }}>
              {hasDebt ? '₪ 4,000' : '✓'}
            </Avatar>
            <Typography variant="body1" mt={1}>חובות בהוראת קבע</Typography>
          </Box>

          <Box textAlign="center">
            <Avatar sx={{ bgcolor: hasStandingOrderIssue ? colors.orange : colors.green, width: 80, height: 80, fontSize: 24 }}>
              {hasStandingOrderIssue ? '₪ 2,500' : '✓'}
            </Avatar>
            <Typography variant="body1" mt={1}>עיכוב בהוראות קבע</Typography>
          </Box>

          <Box textAlign="center">
            <Avatar sx={{ bgcolor: isDepositsOnTime ? colors.green : colors.red, width: 80, height: 80, fontSize: 24 }}>
              {isDepositsOnTime ? '✓' : '!'}
            </Avatar>
            <Typography variant="body1" mt={1}>עמידה בזמני הפקדות</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: colors.sand, p: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          © 2025 נבנה באהבה ע"י אלי פסיקוב
        </Typography>
      </Box>
    </Box>
  );
}
