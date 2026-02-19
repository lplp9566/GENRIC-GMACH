import { FC, useEffect, useMemo, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import useTheme from "@mui/material/styles/useTheme";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { toast } from "react-toastify";
import { StatusGeneric } from "../../common/indexTypes";
import {
  createDepositAction,
  getAllDepositActions,
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
import DepositActionTable from "../components/Deposits/DepositsDetails/DepositActionTable";
import DepositsActions from "../components/Deposits/DepositsAction/DepositsActions";
import DepositDetailsInfoCard from "../components/Deposits/DepositsDetails/DepositDetailsInfoCard";
import ConfirmModal from "../components/genricComponents/confirmModal";
import {
  DepositActionsType,
  IDeposit,
  IDepositActionCreate,
} from "../components/Deposits/depositsDto";

const toInputDate = (value?: Date | string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const DepositsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(null);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionDepositId, setActionDepositId] = useState<number | null>(null);

  const [detailsDepositId, setDetailsDepositId] = useState<number | null>(null);
  const [editDepositId, setEditDepositId] = useState<number | null>(null);
  const [deleteDepositId, setDeleteDepositId] = useState<number | null>(null);
  const [editActionDate, setEditActionDate] = useState<string>("");
  const [editReturnDate, setEditReturnDate] = useState<string>("");

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const { allDeposits, page, pageCount, total, allDepositsStatus } = useSelector(
    (s: RootState) => s.AdminDepositsSlice
  );
  const actions = useSelector((s: RootState) => s.AdminDepositsSlice.depositActions);
  const allActions = useSelector((s: RootState) => s.AdminDepositsSlice.allDepositActions);
  const deposit = useSelector((s: RootState) => s.AdminDepositsSlice.currentDeposit);
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const depositModal = useSelector(
    (state: RootState) => state.mapModeSlice.AddDepositModal
  );
  const limit = 20;

  const findDepositById = (id: number | null): IDeposit | null => {
    if (!id) return null;
    const fromList = allDeposits.find((d) => d.id === id) ?? null;
    if (deposit?.id === id) {
      if (deposit.user) return deposit;
      if (fromList?.user) return { ...deposit, user: fromList.user };
      return deposit;
    }
    return fromList;
  };

  const selectedDeposit = useMemo(
    () => findDepositById(selectedDepositId),
    [selectedDepositId, deposit, allDeposits]
  );
  const actionDeposit = useMemo(
    () => findDepositById(actionDepositId),
    [actionDepositId, deposit, allDeposits]
  );
  const detailsDeposit = useMemo(
    () => findDepositById(detailsDepositId),
    [detailsDepositId, deposit, allDeposits]
  );
  const deleteDeposit = useMemo(
    () => findDepositById(deleteDepositId),
    [deleteDepositId, deposit, allDeposits]
  );

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(getAllDeposits({ page, limit, status: filter, userId: selectedUser.id }));
    } else {
      dispatch(getAllDeposits({ page, limit, status: filter }));
    }
  }, [dispatch, page, filter, selectedUser]);

  useEffect(() => {
    dispatch(getAllDepositActions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDepositId && !allDeposits.some((d) => d.id === selectedDepositId)) {
      setSelectedDepositId(null);
    }
  }, [allDeposits, selectedDepositId]);

  useEffect(() => {
    if (selectedDepositId) {
      dispatch(getDepositDetails(selectedDepositId));
      dispatch(getDepositActions(selectedDepositId));
    }
  }, [dispatch, selectedDepositId]);

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
    setSelectedDepositId(null);
    dispatch(setPage(1));
  };

  const totalAmount = useMemo(
    () =>
      allDeposits.reduce(
        (sum, depositItem) => sum + (depositItem.isActive ? depositItem.current_balance : 0),
        0
      ),
    [allDeposits]
  );

  const tableActions = selectedDepositId ? actions ?? [] : allActions ?? [];

  const refreshAfterAction = async () => {
    if (selectedDepositId) {
      await dispatch(getDepositActions(selectedDepositId));
      await dispatch(getDepositDetails(selectedDepositId));
    }
    await dispatch(getAllDepositActions());
    if (selectedUser?.id) {
      await dispatch(getAllDeposits({ page, limit, status: filter, userId: selectedUser.id }));
    } else {
      await dispatch(getAllDeposits({ page, limit, status: filter }));
    }
  };

  const handleActionSubmit = async (dto: IDepositActionCreate) => {
    await dispatch(createDepositAction(dto)).unwrap();
    await refreshAfterAction();
    setActionsOpen(false);
    setActionDepositId(null);
  };

  const handleEditSave = async () => {
    if (!editDepositId || !editActionDate || !editReturnDate) return;
    try {
      await toast.promise(
        dispatch(
          createDepositAction({
            deposit: editDepositId,
            action_type: DepositActionsType.ChangeReturnDate,
            date: editActionDate,
            update_date: editReturnDate,
          })
        ).unwrap(),
        {
          pending: "מעדכן תאריך...",
          success: "תאריך ההחזרה עודכן.",
          error: "עדכון תאריך נכשל.",
        }
      );
      await refreshAfterAction();
      setEditDepositId(null);
      setEditActionDate("");
      setEditReturnDate("");
    } catch {
      // toast handles errors
    }
  };

  const handleDelete = async () => {
    if (!deleteDeposit) return;
    if ((deleteDeposit.current_balance ?? 0) <= 0) {
      toast.error("לא ניתן למחוק הפקדה עם יתרה 0.");
      return;
    }

    try {
      await toast.promise(
        dispatch(
          createDepositAction({
            deposit: deleteDeposit.id,
            action_type: DepositActionsType.RemoveFromDeposit,
            amount: Number(deleteDeposit.current_balance ?? 0),
            date: toInputDate(new Date()),
            update_date: null,
          })
        ).unwrap(),
        {
          pending: "מוחק הפקדה...",
          success: "ההפקדה נסגרה בהצלחה.",
          error: "מחיקת ההפקדה נכשלה.",
        }
      );
      await refreshAfterAction();
      setDeleteDepositId(null);
    } catch {
      // toast handles errors
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      {depositModal && <NewDepositModal />}

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
              {canWrite && (
                <Button
                  variant="contained"
                  onClick={() => dispatch(setAddDepositModal(true))}
                  fullWidth={isSm}
                  sx={{ bgcolor: "#2a8c82", color: "#fff", "&:hover": { bgcolor: "#1f645f" } }}
                >
                  הוספת הפקדה
                </Button>
              )}

              <FormControl
                size="small"
                fullWidth={isSm}
                sx={{ minWidth: { xs: "auto", sm: 160 } }}
              >
                <InputLabel id="filter-status-label">סינון הפקדות</InputLabel>
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

        {allDepositsStatus === "pending" && <LoadingIndicator />}

        {allDepositsStatus === "fulfilled" && (
          <Box component={Paper} elevation={1} sx={{ p: 2, borderRadius: 2, overflowX: "auto" }}>
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

            <Grid container spacing={3} sx={{ direction: "rtl" }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                  <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        פעולות הפקדות
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedDeposit
                          ? `הפקדה #${selectedDeposit.id} - ${(selectedDeposit.user?.first_name ?? "").trim()} ${(selectedDeposit.user?.last_name ?? "").trim()}`
                          : "מוצגות כל הפעולות כברירת מחדל"}
                      </Typography>
                    </Box>
                    {selectedDepositId && (
                      <Button
                        variant="contained"
                        onClick={() => setSelectedDepositId(null)}
                        sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
                      >
                        הצג את כל הפעולות
                      </Button>
                    )}
                  </Box>

                  {tableActions.length > 0 ? (
                    <DepositActionTable actions={tableActions} />
                  ) : (
                    <Typography>אין נתונים להצגה</Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      הפקדות
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      לחיצה על כרטיס תסנן פעולות לפי הפקדה. כברירת מחדל מוצגות כל הפעולות.
                    </Typography>
                  </Box>

                  {allDeposits.length === 0 ? (
                    <Typography>אין נתונים להצגה</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {allDeposits.map((depositItem) => {
                        const isSelected = depositItem.id === selectedDepositId;
                        return (
                          <Box
                            key={depositItem.id}
                            sx={{
                              border: isSelected ? "2px solid #2a8c82" : "1px solid rgba(0,0,0,0.08)",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <DepositCard
                              deposit={depositItem}
                              readOnly={!canWrite}
                              compactActions
                              onClick={() => setSelectedDepositId(depositItem.id)}
                              onAddAction={() => {
                                setActionDepositId(depositItem.id);
                                setActionsOpen(true);
                              }}
                              onView={() => {
                                dispatch(getDepositDetails(depositItem.id));
                                setDetailsDepositId(depositItem.id);
                              }}
                              onEdit={() => {
                                dispatch(getDepositDetails(depositItem.id));
                                setEditDepositId(depositItem.id);
                                setEditActionDate(toInputDate(new Date()));
                                setEditReturnDate(toInputDate(depositItem.end_date));
                              }}
                              onDelete={() => {
                                setDeleteDepositId(depositItem.id);
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>
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

      <Dialog
        open={actionsOpen && Boolean(actionDepositId)}
        onClose={() => {
          setActionsOpen(false);
          setActionDepositId(null);
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
          {actionDepositId && actionDeposit && (
            <DepositsActions
              depositId={actionDepositId}
              max={actionDeposit.current_balance ?? 0}
              handleSubmit={handleActionSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(detailsDepositId)}
        onClose={() => setDetailsDepositId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {detailsDeposit ? <DepositDetailsInfoCard deposit={detailsDeposit} /> : <LoadingIndicator />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editDepositId)}
        onClose={() => {
          setEditDepositId(null);
          setEditActionDate("");
          setEditReturnDate("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "right" }}>עריכת הפקדה</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="תאריך פעולה"
              type="date"
              value={editActionDate}
              onChange={(e) => setEditActionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="תאריך החזרה חדש"
              type="date"
              value={editReturnDate}
              onChange={(e) => setEditReturnDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setEditDepositId(null);
              setEditActionDate("");
              setEditReturnDate("");
            }}
          >
            ביטול
          </Button>
          <Button variant="contained" onClick={handleEditSave} disabled={!editActionDate || !editReturnDate}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {Boolean(deleteDepositId) && (
        <ConfirmModal
          open={Boolean(deleteDepositId)}
          onClose={() => setDeleteDepositId(null)}
          onSubmit={handleDelete}
          text="למחוק את ההפקדה?"
        />
      )}
    </Box>
  );
};

export default DepositsPage;
