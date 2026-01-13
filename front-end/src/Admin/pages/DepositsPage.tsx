import React, { FC, useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import useTheme from "@mui/material/styles/useTheme";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { StatusGeneric } from "../../common/indexTypes";
import {
  getAllDeposits,
  getDepositActions,
  getDepositDetails,
  setPage,
} from "../../store/features/admin/adminDepositsSlice";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import { setAddDepositModal } from "../../store/features/Main/AppMode";
import NewDepositModal from "../components/Deposits/newDeposit/newDeposit";
import SummaryCard from "../components/Loans/LoansDashboard/SummaryCard";
import DepositCard from "../components/Deposits/DepositsDashboard/DepositCard";
import DepositDetailsInfoCard from "../components/Deposits/DepositsDetails/DepositDetailsInfoCard";
import DepositActionTable from "../components/Deposits/DepositsDetails/DepositActionTable";

const DepositsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(
    null
  );
  const [expanded, setExpanded] = useState(false);
  const [openView, setOpenView] = useState(false);
  const { allDeposits, page, pageCount, total, allDepositsStatus } =
    useSelector((s: RootState) => s.AdminDepositsSlice);
  const actions = useSelector(
    (s: RootState) => s.AdminDepositsSlice.depositActions
  );
  const deposit = useSelector(
    (s: RootState) => s.AdminDepositsSlice.currentDeposit
  );
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const limit = 20;

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(
        getAllDeposits({ page, limit, status: filter, userId: selectedUser.id })
      );
    } else {
      dispatch(getAllDeposits({ page, limit, status: filter }));
    }
  }, [dispatch, page, filter, selectedUser]);

  useEffect(() => {
    if (!openView) return;
    if (allDeposits.length === 0) {
      setSelectedDepositId(null);
      return;
    }
    if (
      !selectedDepositId ||
      !allDeposits.some((d) => d.id === selectedDepositId)
    ) {
      setSelectedDepositId(allDeposits[0].id);
    }
  }, [allDeposits, openView, selectedDepositId]);

  useEffect(() => {
    if (selectedDepositId) {
      dispatch(getDepositDetails(selectedDepositId));
      dispatch(getDepositActions(selectedDepositId));
    }
  }, [dispatch, selectedDepositId]);

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
    dispatch(setPage(1));
  };
  const depositModal = useSelector(
    (state: RootState) => state.mapModeSlice.AddDepositModal
  );
  const totalAmount = useMemo(
    () =>
      allDeposits.reduce(
        (sum, depositItem) =>
          sum + (depositItem.isActive ? depositItem.current_balance : 0),
        0
      ),
    [allDeposits]
  );

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      {depositModal && <NewDepositModal />}

      <Container maxWidth="xl">
        {/* HEADER */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            width: "30%",
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
                src="https://img.icons8.com/office/40/safe-in.png"
                alt="deposit"
              />
              <Typography variant="h5" fontWeight={600} textAlign="center">
                ניהול הפקדות
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
                onClick={() => dispatch(setAddDepositModal(true))}
                fullWidth={isSm}
                sx={{
                  bgcolor: "#2a8c82",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1f645f" },
                }}
              >
                הוספת הפקדה
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
                    color: "#424242",
                    fontWeight: 500,
                    "&.Mui-focused": { color: "#2a8c82" },
                  }}
                >
                  סינון הפקדות
                </InputLabel>
                <Select
                  labelId="filter-status-label"
                  value={filter}
                  label="סינון הפקדות"
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

        {/* LOADING */}
        {allDepositsStatus === "pending" && <LoadingIndicator />}

        {/* DATA */}
        {allDepositsStatus === "fulfilled" && (
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
                  <SummaryCard label="מספר הפקדות" value={total} />
                </Grid>
                <Grid item xs={12} sm={isSm ? 6 : 3}>
                  <SummaryCard
                    label="סך יתרות פעילות"
                    value={`₪${totalAmount.toLocaleString("he-IL")}`}
                  />
                </Grid>
              </Grid>
            )}

            {!openView && (
              <Grid container spacing={4}>
                {allDeposits.map((depositItem) => (
                  <Grid item xs={12} sm={6} md={4} key={depositItem.id}>
                    <DepositCard
                      deposit={depositItem}
                      onClick={() => {
                        setSelectedDepositId(depositItem.id);
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
                          רשימת הפקדות
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedDepositId(null);
                            setOpenView(false);
                            setExpanded(false);
                          }}
                        >
                          חזרה לכל הפקדות
                        </Button>
                      </Box>
                      {allDeposits.length === 0 ? (
                        <Typography>אין נתונים להצגה</Typography>
                      ) : (
                        <Box>
                          {allDeposits.map((depositItem) => {
                            const isSelected =
                              depositItem.id === selectedDepositId;
                            return (
                              <Box
                                key={depositItem.id}
                                sx={{
                                  mb: 2,
                                  border: isSelected
                                    ? "2px solid #2a8c82"
                                    : "1px solid rgba(0,0,0,0.08)",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <DepositCard
                                  deposit={depositItem}
                                  onClick={() =>
                                    setSelectedDepositId(depositItem.id)
                                  }
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
                        פרטי הפקדה
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setExpanded((v) => !v)}
                      >
                        {expanded ? "הצג רשימת הפקדות" : "הרחב תצוגה"}
                      </Button>
                    </Box>
                    {deposit ? (
                      <>
                        <DepositDetailsInfoCard deposit={deposit} />
                      </>
                    ) : (
                      <Typography>אין נתונים להצגה</Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={expanded ? 6 : 4}>
                  <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                    {selectedDepositId ? (
                      <DepositActionTable actions={actions ?? []} />
                    ) : (
                      <Typography>אין נתונים להצגה</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* PAGINATION */}
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
  );
};

export default DepositsPage;
