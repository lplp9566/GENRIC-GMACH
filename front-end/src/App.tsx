// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateLayout from "./layouts/PrivateLayout";
import PublicLayout from "./layouts/PublicLayout";

import LoginPage from "./Admin/pages/LoginPage";
import HomePage from "./Admin/components/HomePage/HomePage";
import LoansPage from "./Admin/pages/LoansPage";
import NewLoan from "./Admin/components/Loans/NewLoan/NewLoanForm";
import LoanDetailsPage from "./Admin/components/Loans/LoanDetails/LoanDetailsPage";
import FundsOverviewDashboard from "./Admin/pages/FundsOverviewDashboard";
import FundsOverviewByYearPage from "./Admin/pages/FundsOverviewByYearPage";
import UsersPage from "./Admin/pages/UsersPage";
import AddNewUser from "./Admin/components/Users/AddNewUser/AddNewUser";
import PaymentsPage from "./Admin/pages/PaymentPage";
import RankPage from "./Admin/pages/RankPage";
import DonationsPage from "./Admin/pages/DonationsPage";
import ExpensesPage from "./Admin/pages/ExpensesPage";
import DepositsPage from "./Admin/pages/DepositsPage";
import DepositDetailsPage from "./Admin/components/Deposits/DepositsDetails/DepositDetailsPage";
import ProtectedRoute from "./Auth/ProtectedRoute";
import Investments from "./Admin/pages/InvestmentsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loans/new" element={<NewLoan />} />
            <Route path="/loans/:id" element={<LoanDetailsPage />} />
            <Route path="/funds" element={<FundsOverviewDashboard />} />
            <Route path="/FundsOverviewByYear" element={<FundsOverviewByYearPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/paymentsPage" element={<PaymentsPage />} />
            <Route path="/rankPage" element={<RankPage />} />
            <Route path="/users/new" element={<AddNewUser />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/deposits" element={<DepositsPage />} />
            <Route path="/deposit/:id" element={<DepositDetailsPage />} />
            <Route path="/investments" element={<Investments />} />
            < Route path="/investments/:id" element={<Investments />} />
          </Route>
        </Route>

        {/* ברירת מחדל */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
