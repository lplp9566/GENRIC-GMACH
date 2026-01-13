import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Pagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  getAllLoans,
  getLoanDetails,
  setPage,
} from "../../store/features/admin/adminLoanSlice";
import SummaryCard from "../components/Loans/LoansDashboard/SummaryCard";
import LoanCard from "../components/Loans/LoansDashboard/LoanCard";
import ActionsTable from "../components/Loans/LoanDetails/ActionsTable";
import LoanHeader from "../components/Loans/LoanDetails/LoanHeader";
import { GeneralLoanInfoCard } from "../components/Loans/LoanDetails/GeneralLoanInfoCard";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import { useNavigate } from "react-router-dom";
import { StatusGeneric } from "../../common/indexTypes";

export const LoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [openView, setOpenView] = useState(false);
  const { allLoans, page, pageCount, status, total } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const limit = 10;

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(
        getAllLoans({ page, limit, status: filter, userId: selectedUser.id })
      );
    } else {
      dispatch(getAllLoans({ page, limit, status: filter }));
    }
  }, [dispatch, page, filter, selectedUser]);

  useEffect(() => {
    if (!openView) return;
    if (allLoans.length === 0) {
      setSelectedLoanId(null);
      return;
    }
    if (!selectedLoanId || !allLoans.some((l) => l.id === selectedLoanId)) {
      setSelectedLoanId(allLoans[0].id);
    }
  }, [allLoans, openView, selectedLoanId]);

  useEffect(() => {
    if (selectedLoanId) dispatch(getLoanDetails(selectedLoanId));
  }, [dispatch, selectedLoanId]);

  useEffect(() => {
    if (selectedLoanId && !allLoans.some((l) => l.id === selectedLoanId)) {
      setSelectedLoanId(null);
    }
  }, [allLoans, selectedLoanId]);

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
    dispatch(setPage(1));
  };

  const selectedLoan = allLoans.find((l) => l.id === selectedLoanId) || null;
  const totalAmount = useMemo(
    () => allLoans.reduce((sum, loan) => sum + loan.loan_amount, 0),
    [allLoans]
  );
  const totalRepaid = useMemo(
    () => allLoans.reduce((sum, loan) => sum + loan.remaining_balance, 0),
    [allLoans]
  );

  return (
    <>
      <Box sx={{ minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              width: "100%",
              mx: "auto",
              dir: "rtl",
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <img
                  width={48}
                  height={48}
                  src="https://img.icons8.com/color/48/loan.png"
                  alt="loan"
                />
                <Typography variant="h5" fontWeight={600} textAlign="center">
                  ניהול הלוואות
                </Typography>
              </Box>

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
                  onClick={() => navigate("/loans/new")}
                  fullWidth={isSm}
                  sx={{
                    bgcolor: "#2a8c82",
                    "&:hover": { bgcolor: "#1f645f" },
                  }}
                >
                  הוספת הלוואה
                </Button>
                <FormControl
                  size="small"
                  fullWidth={isSm}
                  sx={{
                    minWidth: { xs: "auto", sm: 160 },
                  }}
                >
                  <InputLabel
                    id="filter-status-label"
                    sx={{
                      fontWeight: 500,
                      "&.Mui-focused": { color: "#2a8c82" },
                    }}
                  >
                    סינון הלוואות
                  </InputLabel>
                  <Select
                    labelId="filter-status-label"
                    value={filter}
                    label="סינון הלוואות"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                    <MenuItem value={StatusGeneric.ACTIVE}>פעיל</MenuItem>
                    <MenuItem value={StatusGeneric.INACTIVE}>לא פעיל</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </Paper>

          {status === "pending" && <LoadingIndicator />}

          {status === "fulfilled" && (
            <Box
              component={Paper}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                overflowX: "auto",
              }}
            >
              {!openView && (
                <Grid container spacing={2} justifyContent="center" mb={4}>
                  <Grid item xs={12} sm={isSm ? 6 : 3}>
                    <SummaryCard label="מספר הלוואות" value={total} />
                  </Grid>
                  <Grid item xs={12} sm={isSm ? 6 : 3}>
                    <SummaryCard
                      label="סכום הלוואות"
                      value={`₪${totalAmount.toLocaleString("he-IL")}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={isSm ? 6 : 3}>
                    <SummaryCard
                      label="יתרה לתשלום"
                      value={`₪${totalRepaid.toLocaleString("he-IL")}`}
                    />
                  </Grid>
                </Grid>
              )}

              {openView && selectedLoan && loanDetails && (
                <Box sx={{ mb: 4 }}>
                  <LoanHeader
                    firstName={selectedLoan.user.first_name}
                    lastName={selectedLoan.user.last_name}
                    principal={selectedLoan.loan_amount}
                    remaining={loanDetails.remaining_balance}
                    balance={loanDetails.balance}
                    purpose={selectedLoan.purpose}
                  />
                </Box>
              )}

              {!openView && (
                <Grid container spacing={4}>
                  {allLoans.map((loan) => (
                    <Grid item xs={12} sm={6} md={4} key={loan.id}>
                      <LoanCard
                        loan={loan}
                        onClick={() => {
                          setSelectedLoanId(loan.id);
                          setOpenView(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {openView && (
                <Grid container spacing={3} direction="row" sx={{ direction: "ltr" }}>
                  {!expanded && (
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" fontWeight={600}>
                            רשימת הלוואות
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSelectedLoanId(null);
                              setOpenView(false);
                              setExpanded(false);
                            }}
                          >
                            חזרה לכל ההלוואות
                          </Button>
                        </Box>
                        {allLoans.length === 0 ? (
                          <Typography>אין נתונים להצגה</Typography>
                        ) : (
                          <Box>
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
                                    onClick={() => setSelectedLoanId(loan.id)}
                                  />
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12} md={expanded ? 6 : 4}>
                    <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          פרטי הלוואה
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => setExpanded((v) => !v)}
                        >
                          {expanded ? "הצג רשימת הלוואות" : "הרחב תצוגה"}
                        </Button>
                      </Box>
                      {selectedLoan && loanDetails ? (
                        <>
                          <Box sx={{ mt: 2 }}>
                            <GeneralLoanInfoCard loan={loanDetails} />
                          </Box>
                        </>
                      ) : (
                        <Typography>אין נתונים להצגה</Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={expanded ? 6 : 4}>
                    <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                      {selectedLoanId && loanDetails ? (
                        <ActionsTable
                          actions={loanDetails.actions ?? []}
                          loanId={selectedLoanId}
                        />
                      ) : (
                        <Typography>אין נתונים להצגה</Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}

          {pageCount > 1 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, v) => dispatch(setPage(v))}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#424242",
                    "&.Mui-selected": {
                      bgcolor: "#2a8c82",
                      color: "#ffffff",
                      "&:hover": { bgcolor: "#1f645f" },
                    },
                    "&:hover:not(.Mui-selected)": {
                      bgcolor: "#E0E0E0",
                    },
                  },
                  "& .MuiPaginationItem-icon": { color: "#2a8c82" },
                }}
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default LoansPage;
