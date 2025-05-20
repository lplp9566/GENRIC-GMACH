import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './components/NavBar/NavBar';
import { NewLoan } from './pages/NewLoan';
import Loans from './pages/Loans';
import HomePage from './components/HomePage';
import FundsOverviewByYearTable from './components/FundsOvTable';
import FundsOverviewPage from './components/FundsOverviewPage';
import FundsOverviewByYearPage from './pages/FundsOverviewByYearPage';


function App() {
  return (
    <BrowserRouter >
    <Box
    sx={{
      maxHeight: '100vh',
    }}
    >


      <Navbar />
      <Box sx={{ mt: 10, px: 2 }}>
        <Routes>
          <Route path="/loans" element={<Loans />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/loans/new" element={<NewLoan  />} />
          <Route path="/loans/:id" element={<FundsOverviewByYearTable />} />
          <Route path="/funds" element={<FundsOverviewPage />} />
          <Route path='FundsOverviewByYear' element={<FundsOverviewByYearPage />} />
        </Routes>
      </Box>
      </Box>
    </BrowserRouter>
  );
}
export default App;
