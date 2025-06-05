import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './components/NavBar/NavBar';
import LoansPage from './pages/LoansPage';
import HomePage from './components/HomePage/HomePage';
import FundsOverviewByYearPage from './pages/FundsOverviewByYearPage';
import LoanDetels from './components/Loans/LoanDetels';
import NewLoan from './components/Loans/NewLoan/NewLoan';
import FundsOverviewDashboard from './pages/FundsOverviewDashboard';



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
          <Route path="/funds" element={<FundsOverviewDashboard />} />
          <Route path='FundsOverviewByYear' element={<FundsOverviewByYearPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
