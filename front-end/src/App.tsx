import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './components/NavBar/NavBar';
import { NewLoan } from './pages/NewLoan';
import LoansPage from './pages/LoansPage';
import HomePage from './components/HomePage/HomePage';
import FundsOverview from './components/FundsOverview/FundsOverview';
import FundsOverviewByYearPage from './pages/FundsOverviewByYearPage';
import LoanDetels from './components/Loans/LoanDetels';


function App() {
  return (
    <BrowserRouter >
      <Navbar />
      <Box 
      sx={{ mt: 10, px: 2 }}
      >
        <Routes>
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/loans/new" element={<NewLoan  />} />
          <Route path="/loans/:id" element={<LoanDetels />} />
          <Route path="/funds" element={<FundsOverview />} />
          <Route path='FundsOverviewByYear' element={<FundsOverviewByYearPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
