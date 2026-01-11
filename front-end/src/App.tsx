import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

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
import Investments from "./Admin/pages/InvestmentsPage";
import InvestmentDetailsPage from "./Admin/components/Investments/InvestmentDetails/InvestmentDetailsPage";
import StandingOrdersReturnPage from "./Admin/pages/StandingOrdersReturnPage";
import UserHomePage from "./User/pages/UserHomePage";
import UserLoansPage from "./User/pages/UserLoansPage";

import { MatomoTracker } from "./MatomoTracker";
import AuthGuard from "./Auth/AuthGuard";
import { AdminOnlyRoute, UserOnlyRoute } from "./Auth/RoleRoute";

export default function App() {
  return (
    <BrowserRouter>
      <MatomoTracker />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        {/* Private (must be logged in) */}
        <Route element={<AuthGuard />}>
          {/* Admin area */}
          <Route element={<AdminOnlyRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/loans/new" element={<NewLoan />} />
              <Route path="/loans/:id" element={<LoanDetailsPage />} />
              <Route path="/funds" element={<FundsOverviewDashboard />} />
              <Route path="/FundsOverviewByYear" element={<FundsOverviewByYearPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/new" element={<AddNewUser />} />
              <Route path="/paymentsPage" element={<PaymentsPage />} />
              <Route path="/rankPage" element={<RankPage />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/deposits" element={<DepositsPage />} />
              <Route path="/deposit/:id" element={<DepositDetailsPage />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/investments/:id" element={<InvestmentDetailsPage />} />
              <Route path="/standing-orders" element={<StandingOrdersReturnPage />} />
            </Route>
          </Route>

          {/* User area */}
          <Route element={<UserOnlyRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/u" element={<UserHomePage />} />
              <Route path="/u/loans" element={<UserLoansPage />} />
              <Route path="/u/payments" element={<PaymentsPage />} />
              <Route path="/u/donations" element={<DonationsPage />} />
              <Route path="/u/standing-orders" element={<StandingOrdersReturnPage />} />
              <Route path="/u/statistics" element={<FundsOverviewByYearPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

