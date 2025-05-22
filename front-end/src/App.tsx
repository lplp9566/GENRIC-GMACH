import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './components/NavBar/NavBar';
import { NewLoan } from './pages/NewLoan';
import Loans from './pages/Loans';
import HomePage from './components/HomePage/HomePage';
import FundsOverviewByYearTable from './components/FundsOvTable';
import FundsOverview from './components/FundsOverview/FundsOverview';
import FundsOverviewByYearPage from './pages/FundsOverviewByYearPage';


function App() {
  return (
    <BrowserRouter >
      <Navbar />
      <Box 
      sx={{ mt: 10, px: 2 }}
      >
        <Routes>
          <Route path="/loans" element={<Loans />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/loans/new" element={<NewLoan  />} />
          <Route path="/loans/:id" element={<FundsOverviewByYearTable />} />
          <Route path="/funds" element={<FundsOverview />} />
          <Route path='FundsOverviewByYear' element={<FundsOverviewByYearPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
