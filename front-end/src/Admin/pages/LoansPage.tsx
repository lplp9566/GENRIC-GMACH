import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  getAllLoans,
  getAllLoanActions,
  getLoanDetails,
  setPage,
} from "../../store/features/admin/adminLoanSlice";
import SummaryCard from "../components/Loans/LoansDashboard/SummaryCard";
import LoanMiniCard from "../components/Loans/LoansDashboard/LoanMiniCard";
import ActionsTable from "../components/Loans/LoanDetails/ActionsTable";
import Actions from "../components/Loans/LoanActions/Actions";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import { useNavigate } from "react-router-dom";
import { StatusGeneric } from "../../common/indexTypes";
import useLoanSubmit from "../Hooks/LoanHooks/LoanActionsHooks";
import { ICreateLoanAction, ILoanAction } from "../components/Loans/LoanDto";

export const LoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [initialAction, setInitialAction] =
    useState<ICreateLoanAction | null>(null);
  const [actionLoanId, setActionLoanId] = useState<number | null>(null);
  const { allLoans, loanActions, page, status, total } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const limit = 1000;

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
    dispatch(getAllLoanActions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedLoanId) dispatch(getLoanDetails(selectedLoanId));
  }, [dispatch, selectedLoanId]);

  useEffect(() => {
    if (!actionsOpen) return;
    if (!actionLoanId && selectedLoanId) {
      setActionLoanId(selectedLoanId);
    }
  }, [actionsOpen, actionLoanId, selectedLoanId]);

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
  const actionLoan = allLoans.find((l) => l.id === actionLoanId) || null;
  const refreshLoans = () => {
    const opts = selectedUser?.id
      ? { page, limit, status: filter, userId: selectedUser.id }
      : { page, limit, status: filter };
    dispatch(getAllLoans(opts));
  };

  const refreshActions = () => {
    dispatch(getAllLoanActions());
  };

  const handleSubmit = useLoanSubmit(actionLoanId ?? 0, () => {
    setActionsOpen(false);
    setInitialAction(null);
    setActionLoanId(null);
    refreshActions();
    refreshLoans();
  });
  const totalAmount = useMemo(
    () => allLoans.reduce((sum, loan) => sum + loan.loan_amount, 0),
    [allLoans]
  );
  const totalRepaid = useMemo(
    () => allLoans.reduce((sum, loan) => sum + loan.remaining_balance, 0),
    [allLoans]
  );
  const loanIds = useMemo(
    () => new Set(allLoans.map((loan) => loan.id)),
    [allLoans]
  );
  const allActions = useMemo(
    () =>
      (loanActions ?? []).filter((action) =>
        loanIds.has(action.loan?.id ?? -1)
      ),
    [loanActions, loanIds]
  );
  const visibleActions = useMemo(() => {
    if (!selectedLoanId) return allActions;
    if (loanDetails?.actions) return loanDetails.actions;
    return allActions.filter((action) => action.loan?.id === selectedLoanId);
  }, [allActions, loanDetails, selectedLoanId]);
  const handleOpenActions = (
    loanId: number,
    prefill?: ICreateLoanAction | null
  ) => {
    setActionLoanId(loanId);
    setInitialAction(prefill ?? null);
    setActionsOpen(true);
  };

  const handleCopyAction = (action: ILoanAction) => {
    const loanId = action.loan?.id ?? selectedLoanId;
    if (!loanId) return;
    setSelectedLoanId(loanId);
    handleOpenActions(loanId, {
      loanId,
      action_type: action.action_type,
      date: action.date,
      value: action.value,
    });
  };
  const handleActionLoanChange = (loanId: number) => {
    setActionLoanId(loanId);
    setSelectedLoanId(loanId);
  };


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
              width: { xs: "100%", sm: "90%", md: "60%", lg: "40%" },
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  {canWrite && (
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
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/loan-requests")}
                    fullWidth={isSm}
                  >
                    בקשות הלוואה
                  </Button>
                </Stack>
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
              <Grid container spacing={2} justifyContent="center" mb={4}>
                <Grid item xs={12} sm={isSm ? 6 : 3}>
                  <SummaryCard label="מספר הלוואות" value={total} />
                </Grid>
                <Grid item xs={12} sm={isSm ? 6 : 3}>
                  <SummaryCard
                    label="סכום הלוואות"
                    value={`\u20AA${totalAmount.toLocaleString("he-IL")}`}
                  />
                </Grid>
                <Grid item xs={12} sm={isSm ? 6 : 3}>
                  <SummaryCard
                    label="יתרה לתשלום"
                    value={`\u20AA${totalRepaid.toLocaleString("he-IL")}`}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ direction: "rtl" }}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {"פעולות הלוואות"}
                        </Typography>
                        {selectedLoan && (
                          <Typography variant="body2" color="text.secondary">
                            {"הלוואה"} #{selectedLoan.id} - {selectedLoan.user.first_name} {selectedLoan.user.last_name}
                          </Typography>
                        )}
                      </Box>
                      {selectedLoanId && (
                        <Button
                          variant="outlined"
                          onClick={() => setSelectedLoanId(null)}
                        >
                          {"הצג את כל הפעולות"}
                        </Button>
                      )}
                    </Box>
                    {visibleActions.length === 0 ? (
                      <Typography>
                        {"אין פעולות להצגה"}
                      </Typography>
                    ) : (
                      <ActionsTable
                        actions={visibleActions}
                        loanId={selectedLoanId ?? undefined}
                        readOnly={!canWrite}
                        onCopyAction={handleCopyAction}
                        showLoanColumn={!selectedLoanId}
                        title={
                          selectedLoanId
                            ? "פעולות על הלוואה"
                            : "פעולות על כל ההלוואות"
                        }
                      />
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {"הלוואות"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedLoanId
                          ? "בחרת הלוואה להצגת פעולות."
                          : "בחר הלוואה להצגת פעולות."}
                      </Typography>
                    </Box>
                    {allLoans.length === 0 ? (
                      <Typography>
                        {"אין הלוואות להצגה"}
                      </Typography>
                    ) : (
                      <Stack spacing={1.5}>
                        {allLoans.map((loan) => (
                          <LoanMiniCard
                            key={loan.id}
                            loan={loan}
                            selected={loan.id === selectedLoanId}
                            onSelect={() => setSelectedLoanId(loan.id)}
                            onActionSuccess={() => {
                              refreshLoans();
                              refreshActions();
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <Dialog
            open={actionsOpen}
            onClose={() => {
              setActionsOpen(false);
              setInitialAction(null);
              setActionLoanId(null);
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                bgcolor: "transparent",
                boxShadow: "none",
              },
            }}
          >
          <DialogContent sx={{ p: 0, background: "transparent" }}>
            {(actionLoanId || selectedLoanId) && (
              <Actions
                loanId={actionLoanId ?? selectedLoanId!}
                handleSubmit={handleSubmit}
                max={
                  actionLoan?.remaining_balance ??
                  loanDetails?.remaining_balance ??
                  0
                }
                initialAction={initialAction}
                loanOptions={allLoans}
                selectedLoanId={actionLoanId ?? selectedLoanId ?? undefined}
                onLoanChange={handleActionLoanChange}
                showLoanSelect
              />
            )}
          </DialogContent>
        </Dialog>

        </Container>
      </Box>
    </>
  );
};

export default LoansPage;
