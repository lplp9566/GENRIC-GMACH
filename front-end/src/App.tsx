import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import NewLoan from './Admin/components/Loans/NewLoan/NewLoanForm';
import Navbar from './Admin/components/NavBar/NavBar';
import LoansPage from './Admin/pages/LoansPage';
import HomePage from './Admin/components/HomePage/HomePage';
import PaymentsPage from './Admin/pages/PaymentPage';
import FundsOverviewByYearPage from './Admin/pages/FundsOverviewByYearPage';
import LoanDetailsPage from './Admin/components/Loans/LoanDetails/LoanDetailsPage';
import FundsOverviewDashboard from './Admin/pages/FundsOverviewDashboard';
import RankPage from './Admin/pages/RankPage';
import AddNewUser from './Admin/components/Users/AddNewUser/AddNewUser';
import UsersPage from './Admin/pages/UsersPage';
import DonationsPage from './Admin/pages/DonationsPage';
import ExpensesPage from './Admin/pages/ExpensesPage';
import DepositsPage from './Admin/pages/DepositsPage';
import DepositDetailsPage from './Admin/components/Deposits/DepositsDetails/DepositDetailsPage';



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
          <Route path='/users/new' element={<AddNewUser />} />
          <Route path='/donations' element={<DonationsPage/>} />
          <Route path='/expenses' element={<ExpensesPage/>} />
          <Route path='/deposits' element={<DepositsPage/>} />
          <Route path='/deposit/:id' element={<DepositDetailsPage />} />

        </Routes>
      </Box>
    </BrowserRouter>
  );
}
export default App;
