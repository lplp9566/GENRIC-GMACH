import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userId = authUser?.user?.id;
  const { allLoans, status, loanDetails } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [autoFallback, setAutoFallback] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(
        getAllLoans({
          page: 1,
          limit: 100,
          status: filter,
          userId,
        })
      );
    }
  }, [dispatch, userId, filter]);

  useEffect(() => {
    if (
      filter === StatusGeneric.ACTIVE &&
      status === "fulfilled" &&
      allLoans.length === 0 &&
      !autoFallback
    ) {
      setAutoFallback(true);
      setFilter(StatusGeneric.ALL);
    }
  }, [filter, status, allLoans.length, autoFallback]);

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
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            width: { xs: "100%", sm: "90%", md: "60%", lg: "40%" },
            mx: "auto",
            dir: "rtl",
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={600} textAlign="center">
              הלוואות
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={() => window.location.assign("/u/loan-requests")}
                fullWidth={isSm}
                sx={{
                  bgcolor: "#2a8c82",
                  "&:hover": { bgcolor: "#1f645f" },
                }}
              >
                בקשת הלוואה
              </Button>
              <FormControl size="small" fullWidth={isSm}>
                <InputLabel id="user-loans-filter-label">סטטוס</InputLabel>
                <Select
                  labelId="user-loans-filter-label"
                  label="סטטוס"
                  value={filter}
                  onChange={(e) => {
                    setAutoFallback(false);
                    setFilter(e.target.value as StatusGeneric);
                  }}
                >
                  <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                  <MenuItem value={StatusGeneric.ACTIVE}>פעילות</MenuItem>
                  <MenuItem value={StatusGeneric.INACTIVE}>לא פעילות</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Paper>
        <Grid container spacing={3} direction="row" sx={{ direction: "ltr" }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                הלוואות
              </Typography>
              <Box>
                {allLoans.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    אין הלוואות על שמך
                  </Typography>
                ) : (
                  allLoans.map((loan) => {
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
                  })
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              {selectedLoan && loanDetails ? (
                <>
                  <LoanHeader
                    principal={selectedLoan.loan_amount}
                    remaining={loanDetails.remaining_balance}
                    balance={loanDetails.balance}
                  />
                  <Box sx={{ mt: 2 }}>
                    <GeneralLoanInfoCard loan={loanDetails} />
                  </Box>
                </>
              ) : (
                <Typography variant="body1">בחר הלוואה להצגת פרטים.</Typography>
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
                <Typography variant="body1">בחר הלוואה להצגת הפעולות.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserLoansPage;
