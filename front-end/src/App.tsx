import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';
import FundsOverview from "./componets/FundsOverview";

const App: React.FC = () => {
  const [fundsData, setFundsData] = useState(null);

  useEffect(() => {
    axios.get('https://ahavat-chesed-2.onrender.com/funds-overview')
      .then((response) => setFundsData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (

    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        מצב קרנות הגמ"ח
      </Typography>
      {fundsData ? <FundsOverview data={fundsData} /> : <Typography>טוען נתונים...</Typography>}
    </Container>
  );
};

export default App;
