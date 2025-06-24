import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import NewLoan from './Admin/components/Loans/NewLoan/NewLoanForm';
import Navbar from './Admin/components/NavBar/NavBar';
import LoansPage from './Admin/pages/LoansPage';
import HomePage from './Admin/components/HomePage/HomePage';
import UsersPage from './Admin/components/Users/UsersComponets';
import PaymentsPage from './Admin/pages/PaymentPage';
import FundsOverviewByYearPage from './Admin/pages/FundsOverviewByYearPage';
import LoanDetailsPage from './Admin/components/Loans/LoanDetails/LoanDetailsPage';
import FundsOverviewDashboard from './Admin/pages/FundsOverviewDashboard';
import RankPage from './Admin/pages/RankPage';



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
          <Route path="/loans/:id" element={<LoanDetailsPage />} />
          <Route path="/funds" element={<FundsOverviewDashboard />} />
          <Route path='FundsOverviewByYear' element={<FundsOverviewByYearPage />} />
          <Route path="/users" element={<UsersPage/>} />
          <Route path='paymentsPage' element=  {<PaymentsPage/>}/>
          <Route path='/rankPage' element={<RankPage/>} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
