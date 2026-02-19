import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { StatusGeneric } from "../../common/indexTypes";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import SummaryCard from "../components/Loans/LoansDashboard/SummaryCard";
import InvestmentAction from "../components/Investments/InvestmentDetails/InvestmentAction";
import InvestmentActionTable from "../components/Investments/InvestmentDetails/InvestmentActionTable";
import NewInvestment from "../components/Investments/NewInvestment";
import InvestmentMiniCard from "../components/Investments/InvestmentDashboard/InvestmentMiniCard";
import {
  getAllInvestmentTransactions,
  getAllInvestments,
} from "../../store/features/admin/adminInvestmentsSlice";

const InvestmentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<number | null>(
    null
  );
  const [newInvestmentOpen, setNewInvestmentOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const {
    allInvestments,
    allInvestmentTransactions,
    getAllInvestmentsStatus,
    getAllInvestmentTransactionsStatus,
  } = useSelector((s: RootState) => s.AdminInvestmentsSlice);

  useEffect(() => {
    dispatch(getAllInvestments());
    dispatch(getAllInvestmentTransactions());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getAllInvestments());
    dispatch(getAllInvestmentTransactions());
  };

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
  };

  const filteredInvestments = useMemo(() => {
    return allInvestments.filter((inv) => {
      if (filter === StatusGeneric.ALL) return true;
      if (filter === StatusGeneric.ACTIVE) return inv.is_active;
      return !inv.is_active;
    });
  }, [allInvestments, filter]);

  useEffect(() => {
    if (
      selectedInvestmentId &&
      !filteredInvestments.some((inv) => inv.id === selectedInvestmentId)
    ) {
      setSelectedInvestmentId(null);
    }
  }, [filteredInvestments, selectedInvestmentId]);

  const selectedInvestment =
    filteredInvestments.find((inv) => inv.id === selectedInvestmentId) ?? null;

  const investmentIds = useMemo(
    () => new Set(filteredInvestments.map((inv) => inv.id)),
    [filteredInvestments]
  );

  const allActions = useMemo(
    () =>
      (allInvestmentTransactions ?? []).filter((tx) =>
        investmentIds.has(tx.investment?.id ?? -1)
      ),
    [allInvestmentTransactions, investmentIds]
  );

  const visibleActions = useMemo(() => {
    if (!selectedInvestmentId) return allActions;
    return allActions.filter((tx) => tx.investment?.id === selectedInvestmentId);
  }, [allActions, selectedInvestmentId]);

  const totalPrincipal = useMemo(
    () =>
      filteredInvestments.reduce(
        (sum, inv) => sum + Number(inv.total_principal_invested ?? 0),
        0
      ),
    [filteredInvestments]
  );
  const totalCurrent = useMemo(
    () =>
      filteredInvestments.reduce(
        (sum, inv) => sum + Number(inv.current_value ?? 0),
        0
      ),
    [filteredInvestments]
  );
  const totalProfit = useMemo(
    () =>
      filteredInvestments.reduce(
        (sum, inv) => sum + Number(inv.profit_realized ?? 0),
        0
      ),
    [filteredInvestments]
  );

  const isPending =
    getAllInvestmentsStatus === "idle" ||
    getAllInvestmentTransactionsStatus === "idle";

  return (
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
                src="https://img.icons8.com/?size=100&id=ek6vl8DEBehk&format=png&color=000000"
                alt="investment"
              />
              <Typography variant="h5" fontWeight={600} textAlign="center">
                ניהול השקעות
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
              {canWrite && (
                <Button
                  variant="contained"
                  onClick={() => setNewInvestmentOpen(true)}
                  fullWidth={isSm}
                  sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
                >
                  הוספת השקעה
                </Button>
              )}

              <FormControl
                size="small"
                fullWidth={isSm}
                sx={{ minWidth: { xs: "auto", sm: 160 } }}
              >
                <InputLabel id="investments-filter-status-label">סינון השקעות</InputLabel>
                <Select
                  labelId="investments-filter-status-label"
                  value={filter}
                  label="סינון השקעות"
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

        {isPending && <LoadingIndicator />}

        {!isPending && (
          <Box component={Paper} elevation={1} sx={{ p: 2, borderRadius: 2, overflowX: "auto" }}>
            <Grid container spacing={2} justifyContent="center" mb={4}>
              <Grid item xs={12} sm={isSm ? 6 : 3}>
                <SummaryCard label="מספר השקעות" value={filteredInvestments.length} />
              </Grid>
              <Grid item xs={12} sm={isSm ? 6 : 3}>
                <SummaryCard
                  label="סך קרן מושקעת"
                  value={`₪${totalPrincipal.toLocaleString("he-IL")}`}
                />
              </Grid>
              <Grid item xs={12} sm={isSm ? 6 : 3}>
                <SummaryCard
                  label="שווי נוכחי"
                  value={`₪${totalCurrent.toLocaleString("he-IL")}`}
                />
              </Grid>
              <Grid item xs={12} sm={isSm ? 6 : 3}>
                <SummaryCard
                  label="רווח ממומש"
                  value={`₪${totalProfit.toLocaleString("he-IL")}`}
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
                        פעולות השקעות
                      </Typography>
                      {selectedInvestment && (
                        <Typography variant="body2" color="text.secondary">
                          השקעה #{selectedInvestment.id} - {selectedInvestment.investment_name}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {selectedInvestmentId && (
                        <Button variant="outlined" onClick={() => setSelectedInvestmentId(null)}>
                          הצג את כל הפעולות
                        </Button>
                      )}
                      {canWrite && (
                        <Button
                          variant="contained"
                          onClick={() => setActionsOpen(true)}
                          disabled={!selectedInvestment || !selectedInvestment.is_active}
                          sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
                        >
                          פעולות להשקעה
                        </Button>
                      )}
                    </Stack>
                  </Box>

                  {visibleActions.length === 0 ? (
                    <Typography>אין פעולות להצגה</Typography>
                  ) : (
                    <InvestmentActionTable
                      actions={visibleActions}
                      showInvestmentColumn={!selectedInvestmentId}
                      title={
                        selectedInvestmentId
                          ? "פעולות על השקעה"
                          : "פעולות על כל ההשקעות"
                      }
                    />
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      השקעות
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedInvestmentId
                        ? "בחרת השקעה להצגת פעולות."
                        : "בחר השקעה להצגת פעולות."}
                    </Typography>
                  </Box>

                  {filteredInvestments.length === 0 ? (
                    <Typography>אין השקעות להצגה</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {filteredInvestments.map((inv) => (
                        <InvestmentMiniCard
                          key={inv.id}
                          investment={inv}
                          selected={inv.id === selectedInvestmentId}
                          onSelect={() => setSelectedInvestmentId(inv.id)}
                          onOpenAction={() => {
                            setSelectedInvestmentId(inv.id);
                            setActionsOpen(true);
                          }}
                          onActionSuccess={handleRefresh}
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
          open={actionsOpen && Boolean(selectedInvestmentId)}
          onClose={() => setActionsOpen(false)}
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
            {selectedInvestmentId && (
              <InvestmentAction
                investmentId={selectedInvestmentId}
                onChanged={() => {
                  setActionsOpen(false);
                  handleRefresh();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <NewInvestment
          open={newInvestmentOpen}
          onClose={() => setNewInvestmentOpen(false)}
        />
      </Container>
    </Box>
  );
};

export default InvestmentsPage;
