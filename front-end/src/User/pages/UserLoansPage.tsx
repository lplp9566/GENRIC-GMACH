import React, { useEffect, useState } from "react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getAllLoans,
  getLoanDetails,
} from "../../store/features/admin/adminLoanSlice";
import { StatusGeneric } from "../../common/indexTypes";
import LoanCard from "../../Admin/components/Loans/LoansDashboard/LoanCard";
import LoanHeader from "../../Admin/components/Loans/LoanDetails/LoanHeader";
import { GeneralLoanInfoCard } from "../../Admin/components/Loans/LoanDetails/GeneralLoanInfoCard";
import ActionsTable from "../../Admin/components/Loans/LoanDetails/ActionsTable";
import LoadingIndicator from "../../Admin/components/StatusComponents/LoadingIndicator";

const UserLoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userId = authUser?.user?.id;
  const { allLoans, status, loanDetails } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      dispatch(
        getAllLoans({
          page: 1,
          limit: 100,
          status: StatusGeneric.ACTIVE,
          userId,
        })
      );
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (allLoans.length === 0) return;
    if (!selectedLoanId || !allLoans.some((l) => l.id === selectedLoanId)) {
      setSelectedLoanId(allLoans[0].id);
    }
  }, [allLoans, selectedLoanId]);

  useEffect(() => {
    if (selectedLoanId) {
      dispatch(getLoanDetails(selectedLoanId));
    }
  }, [dispatch, selectedLoanId]);

  const selectedLoan = allLoans.find((l) => l.id === selectedLoanId) || null;

  if (status === "pending" && allLoans.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 4, direction: "rtl" }}>
      <Container maxWidth="xl">
        <Grid container spacing={3} direction="row" sx={{ direction: "ltr" }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Loans
              </Typography>
              <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
                {allLoans.map((loan) => {
                  const isSelected = loan.id === selectedLoanId;
                  return (
                    <Box
                      key={loan.id}
                      sx={{
                        mb: 2,
                        border: isSelected
                          ? "2px solid #2a8c82"
                          : "1px solid rgba(0,0,0,0.08)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <LoanCard
                        loan={loan}
                        readOnly
                        onClick={() => setSelectedLoanId(loan.id)}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              {selectedLoan && loanDetails ? (
                <>
                  <LoanHeader
                    firstName={selectedLoan.user.first_name}
                    lastName={selectedLoan.user.last_name}
                    principal={selectedLoan.loan_amount}
                    remaining={loanDetails.remaining_balance}
                    balance={loanDetails.balance}
                    purpose={selectedLoan.purpose}
                  />
                  <Box sx={{ mt: 2 }}>
                    <GeneralLoanInfoCard loan={loanDetails} />
                  </Box>
                </>
              ) : (
                <Typography variant="body1">
                  Select a loan to view details.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              {selectedLoanId && loanDetails ? (
                <ActionsTable
                  actions={loanDetails.actions ?? []}
                  loanId={selectedLoanId}
                  readOnly
                />
              ) : (
                <Typography variant="body1">
                  Select a loan to view actions.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserLoansPage;
