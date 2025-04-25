import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';
import FundsOverview from "./componets/FundsOverview";

const App: React.FC = () => {
  const [fundsData, setFundsData] = useState<Array<any>>([]);
  const [users, setusers] = useState<Array<any>>([])

  useEffect(() => {
    axios.get('https://ahavat-chesed-2.onrender.com/funds-overview')

      .then((response) => setFundsData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
      axios.get('https://ahavat-chesed-2.onrender.com/users')
      .then((response)=> setusers(response.data))
      axios.get('https://ahavat-chesed-2.onrender.com/loans')
      .then((response) => console.log(response.data))
      .catch((error) => console.error("Error fetching data:", error));

  }, []);
  console.log(users)
  return (

    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        מצב קרנות הגמ"ח 
      </Typography>
  {users!.map((user:any)=> user.payment_details.monthly_balance < 0? 
    <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
      {user.first_name} {user.last_name} 
      </Typography> : null
  )}
      {/* <FundsOverview data={fundsData} /> */}

      {/* {fundsData ? <FundsOverview data={fundsData} /> : <Typography>טוען נתונים...</Typography>} */}
    </Container>
  );
};

export default App;
