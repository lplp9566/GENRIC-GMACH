import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  addGuarantor,
  approveGuarantor,
  checkLoanRequest,
  createLoanRequest,
  fetchGuarantorRequests,
  fetchLoanRequests,
  rejectGuarantor,
  updateLoanRequestDetails,
} from "../../store/features/loanRequests/loanRequestsSlice";
import { getAllUsers } from "../../store/features/admin/adminUsersSlice";

const UserLoanRequestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userId = authUser?.user?.id;
  const isMember = Boolean(authUser?.user?.is_member);

  const { requests, guarantorRequests, checkResponse } = useSelector(
    (s: RootState) => s.LoanRequestsSlice
  );
  const allUsers = useSelector((s: RootState) => s.AdminUsers.allUsers);

  const [amount, setAmount] = useState<number | "">("");
  const [monthlyPayment, setMonthlyPayment] = useState<number | "">("");
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");
  const [paymentDate, setPaymentDate] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<string>("direct_debit");
  const [guarantorId, setGuarantorId] = useState<number | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [checkDone, setCheckDone] = useState(false);
  const [guarantorFilter, setGuarantorFilter] = useState<
    "pending" | "open" | "rejected" | "all"
  >("pending");

  const statusMap: Record<
    string,
    { label: string; color: string }
  > = {
    DRAFT: { label: "טיוטה", color: "text.secondary" },
    CHECK_FAILED: { label: "בדיקה נכשלה", color: "error.main" },
    NEED_DETAILS: { label: "נדרשים פרטים", color: "warning.main" },
    NEED_GUARANTOR: { label: "נדרש ערב", color: "warning.main" },
    GUARANTOR_PENDING: { label: "ממתין לאישור ערב", color: "info.main" },
    GUARANTOR_REJECTED: { label: "ערב דחה", color: "error.main" },
    ADMIN_PENDING: { label: "ממתין לאישור מנהל", color: "info.main" },
    ADMIN_APPROVED: { label: "אושר", color: "success.main" },
    ADMIN_REJECTED: { label: "נדחה", color: "error.main" },
  };

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchLoanRequests(userId));
    dispatch(fetchGuarantorRequests(userId));
    dispatch(getAllUsers({ membershipType: "MEMBER", isAdmin: false }));
  }, [dispatch, userId]);

  const activeRequest = useMemo(
    () => requests.find((r) => r.id === activeRequestId) || null,
    [requests, activeRequestId]
  );
  useEffect(() => {
    if (!activeRequest) return;
    setAmount(activeRequest.amount ?? "");
    setMonthlyPayment(activeRequest.monthly_payment ?? "");
    setPurpose(activeRequest.purpose ?? "");
    setPaymentDate(activeRequest.payment_date ?? "");
    setPaymentMethod(activeRequest.payment_method ?? "direct_debit");
  }, [activeRequest]);

  const handleCheck = async () => {
    if (!userId || amount === "" || monthlyPayment === "") return;
    const res = await dispatch(
      checkLoanRequest({
        userId,
        amount: Number(amount),
        monthly_payment: Number(monthlyPayment),
      })
    ).unwrap();
    setCheckDone(Boolean(res?.ok));
  };

  const handleCreateRequest = async () => {
    if (!userId || amount === "" || monthlyPayment === "") return;
    if (!purpose || paymentDate === "" || !paymentMethod) return;
    if (!checkDone || !checkResponse?.ok) return;
    const res = await dispatch(
      createLoanRequest({
        userId,
        amount: Number(amount),
        monthly_payment: Number(monthlyPayment),
        purpose,
        payment_date: Number(paymentDate),
        payment_method: paymentMethod,
      })
    ).unwrap();
    if (!res.request) {
      setCheckDone(false);
      return;
    }
    setActiveRequestId(res.request.id);
    setCreateOpen(false);
    setCheckDone(false);
  };

  const handleSaveDetails = async () => {
    if (!activeRequestId) return;
    if (!purpose || paymentDate === "" || !paymentMethod) return;
    await dispatch(
      updateLoanRequestDetails({
        id: activeRequestId,
        purpose,
        payment_date: Number(paymentDate),
        payment_method: paymentMethod,
      })
    ).unwrap();
    if (isMember) {
      setCreateOpen(false);
    }
  };

  const handleAddGuarantor = async () => {
    if (!activeRequestId || guarantorId === "") return;
    await dispatch(
      addGuarantor({ id: activeRequestId, guarantorId: Number(guarantorId) })
    ).unwrap();
    setCreateOpen(false);
  };

  const openRequestDetails = (reqId: number) => {
    setActiveRequestId(reqId);
    setCreateOpen(true);
  };

  const canEditDetails =
    activeRequest?.status !== "ADMIN_APPROVED" &&
    activeRequest?.status !== "ADMIN_REJECTED";

  return (
    <Box sx={{ minHeight: "100vh", py: 4, direction: "rtl" }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={700} mb={2}>
          בקשות הלוואה
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              setCreateOpen(true);
              setActiveRequestId(null);
              setCheckDone(false);
              setAmount("");
              setMonthlyPayment("");
              setPurpose("");
              setPaymentDate("");
              setPaymentMethod("direct_debit");
            }}
          >
            הוספת בקשה
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {requests.length === 0 && (
                  <Typography color="text.secondary">
                    אין בקשות פעילות
                  </Typography>
                )}
                {requests.length > 0 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="right">מספר</TableCell>
                          <TableCell align="right">סטטוס</TableCell>
                          <TableCell align="right">סכום</TableCell>
                          <TableCell align="right">החזר חודשי</TableCell>
                          <TableCell align="right">תאריך</TableCell>
                          <TableCell align="right">פעולות</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requests.map((req) => (
                          <TableRow key={req.id} hover>
                            <TableCell align="right">#{req.id}</TableCell>
                            <TableCell align="right">
                              <Typography
                                sx={{
                                  color:
                                    statusMap[req.status]?.color ??
                                    "text.secondary",
                                  fontWeight: 600,
                                }}
                              >
                                {statusMap[req.status]?.label ?? req.status}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{req.amount}</TableCell>
                            <TableCell align="right">{req.monthly_payment}</TableCell>
                            <TableCell align="right">
                              {req.created_at
                                ? new Date(req.created_at).toLocaleDateString("he-IL")
                                : "-"}
                            </TableCell>
                            <TableCell align="right">
                              {
                                req.status != "ADMIN_APPROVED"  && (
<Button
                                size="small"
                                variant="text"
                                onClick={() => openRequestDetails(req.id)}
                              >
                                עריכה
                              </Button>
                                )
                              }
                              
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            הודעות ערבויות
          </Typography>
          <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
            <InputLabel id="guarantor-filter-label">סינון</InputLabel>
            <Select
              labelId="guarantor-filter-label"
              label="סינון"
              value={guarantorFilter}
              onChange={(e) =>
                setGuarantorFilter(
                  e.target.value as "pending" | "open" | "rejected" | "all"
                )
              }
            >
              <MenuItem value="pending">ממתינות לאישור</MenuItem>
              <MenuItem value="open">פתוחות</MenuItem>
              <MenuItem value="rejected">דחויות</MenuItem>
              <MenuItem value="all">הכל</MenuItem>
            </Select>
          </FormControl>
          {guarantorRequests.length === 0 && (
            <Typography color="text.secondary">
              אין בקשות ערבויות
            </Typography>
          )}
          <Grid container spacing={2}>
            {guarantorRequests
              .filter((g) => {
                if (guarantorFilter === "all") return true;
                if (guarantorFilter === "pending")
                  return g.status === "PENDING";
                if (guarantorFilter === "rejected")
                  return g.status === "REJECTED";
                if (guarantorFilter === "open")
                  return g.status === "PENDING";
                return true;
              })
              .map((g) => (
              <Grid item xs={12} md={6} key={g.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography fontWeight={600}>
                      בקשת ערב לבקשה #{g.request?.id}
                    </Typography>
                    <Typography>
                      מבקש: {g.request?.user?.first_name}{" "}
                      {g.request?.user?.last_name}
                    </Typography>
                    <Typography>מטרה: {g.request?.purpose || "-"}</Typography>
                    <Typography>סכום: {g.request?.amount}</Typography>
                    <Typography>
                      החזר חודשי: {g.request?.monthly_payment}
                    </Typography>
                    <Typography>
                      יום חיוב: {g.request?.payment_date ?? "-"}
                    </Typography>
                    <Typography>
                      אמצעי חיוב: {g.request?.payment_method ?? "-"}
                    </Typography>
                    <Typography>סטטוס: {g.status}</Typography>
                    {g.status === "PENDING" && (
                      <Stack direction="row" spacing={1} mt={1}>
                        <Button
                          variant="contained"
                          onClick={() =>
                            dispatch(
                              approveGuarantor({ id: g.request.id, gid: g.id })
                            )
                          }
                        >
                          אישור
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() =>
                            dispatch(
                              rejectGuarantor({ id: g.request.id, gid: g.id })
                            )
                          }
                        >
                          דחייה
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>בקשת הלוואה חדשה</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="סכום"
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <TextField
              label="החזר חודשי"
              fullWidth
              type="number"
              value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(Number(e.target.value))}
          />
          {activeRequestId === null && (
            <>
              <Button variant="outlined" onClick={handleCheck}>
                בדיקת זכאות
              </Button>
              {checkResponse && (
                <Typography color={checkResponse.ok ? "success.main" : "error"}>
                  {checkResponse.ok
                    ? "הבדיקה עברה בהצלחה"
                    : checkResponse.error || "הבדיקה נכשלה"}
                </Typography>
              )}
            </>
          )}
          <TextField
            label="מטרה"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            fullWidth
            disabled={!canEditDetails}
          />
          <TextField
            label="יום חיוב (1-28)"
            type="number"
            value={paymentDate}
            onChange={(e) => setPaymentDate(Number(e.target.value))}
            fullWidth
            disabled={!canEditDetails}
          />
          <FormControl fullWidth>
            <InputLabel>אמצעי חיוב</InputLabel>
            <Select
              value={paymentMethod}
              label="אמצעי חיוב"
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={!canEditDetails}
            >
              <MenuItem value="direct_debit">הוראת קבע</MenuItem>
              <MenuItem value="credit_card">כרטיס אשראי</MenuItem>
              <MenuItem value="bank_transfer">העברה בנקאית</MenuItem>
              <MenuItem value="cash">מזומן</MenuItem>
              <MenuItem value="other">אחר</MenuItem>
            </Select>
          </FormControl>
          {activeRequestId === null ? (
            <Button
              variant="contained"
              onClick={handleCreateRequest}
              disabled={!checkDone || !checkResponse?.ok}
            >
              שליחת בקשה
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSaveDetails}
              disabled={!canEditDetails}
            >
              שמירת פרטים
            </Button>
          )}
          {!isMember &&
            activeRequestId !== null &&
            (activeRequest?.status === "NEED_GUARANTOR" ||
              activeRequest?.status === "GUARANTOR_REJECTED") && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>בחירת ערב</InputLabel>
                  <Select
                    value={guarantorId}
                    label="בחירת ערב"
                    onChange={(e) => setGuarantorId(Number(e.target.value))}
                    disabled={!canEditDetails}
                  >
                    {(allUsers || []).map((u: any) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={handleAddGuarantor}>
                  שליחת בקשת ערב
                </Button>
              </Stack>
            )}
        </Stack>
      </DialogContent>
    </Dialog>
    </Box>
  );
};

export default UserLoanRequestsPage;
