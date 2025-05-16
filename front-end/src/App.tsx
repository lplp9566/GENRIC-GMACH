import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Box } from '@mui/material';
import { Navbar } from './componets/NavBar/NavBar';
import { LoanDetails } from './pages/LoanDetels';
import { NewLoan } from './pages/NewLoan';
import Loans from './pages/Loans';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Box sx={{ mt: 10, px: 2 }}>
        <Routes>
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/new" element={<NewLoan />} />
          <Route path="/loans/:id" element={<LoanDetails />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
