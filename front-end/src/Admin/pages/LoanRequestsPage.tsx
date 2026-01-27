import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
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
  adminApproveRequest,
  adminRejectRequest,
  fetchLoanRequests,
  updateLoanRequestDetails,
} from "../../store/features/loanRequests/loanRequestsSlice";
import CheckLoanModal from "../components/Loans/CheckLoanModal";
import { ICreateLoan } from "../components/Loans/LoanDto";

const LoanRequestsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests } = useSelector((s: RootState) => s.LoanRequestsSlice);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkLoan, setCheckLoan] = useState<ICreateLoan | null>(null);
  const [approveId, setApproveId] = useState<number | null>(null);

  const statusMap: Record<string, { label: string; color: string }> = {
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
    dispatch(fetchLoanRequests());
  }, [dispatch]);

  const openCheckModal = (reqId: number) => {
    const req = requests.find((r) => r.id === reqId);
    if (!req) return;
    const payload: ICreateLoan = {
      user: req.user.id,
      loan_amount: req.amount,
      loan_date: new Date().toISOString().slice(0, 10),
      purpose: req.purpose ?? "",
      monthly_payment: req.monthly_payment,
      payment_date: req.payment_date ?? 1,
      first_payment_date: null,
    };
    setCheckLoan(payload);
    setApproveId(reqId);
    setCheckOpen(true);
  };

  const selectedRequest = requests.find((r) => r.id === selected) || null;
  const [editPurpose, setEditPurpose] = useState("");
  const [editPaymentDate, setEditPaymentDate] = useState<number | "">("");
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>("direct_debit");
  const guarantorNames =
    selectedRequest?.guarantor_requests?.map(
      (g) => `${g.guarantor.first_name} ${g.guarantor.last_name}`
    ) ?? [];

  useEffect(() => {
    if (!selectedRequest) return;
    setEditPurpose(selectedRequest.purpose ?? "");
    setEditPaymentDate(selectedRequest.payment_date ?? "");
    setEditPaymentMethod(selectedRequest.payment_method ?? "direct_debit");
  }, [selectedRequest]);

  const canEditRequest = selectedRequest?.status === "ADMIN_PENDING";

  return (
    <Box sx={{ minHeight: "100vh", py: 4, direction: "rtl" }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={700} mb={3}>
          בקשות הלוואה
        </Typography>
        {requests.length === 0 && (
          <Typography color="text.secondary">אין בקשות להצגה</Typography>
        )}
        {requests.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="right">שם הלווה</TableCell>
                  <TableCell align="right">מטרה</TableCell>
                  <TableCell align="right">סכום</TableCell>
                  <TableCell align="right">החזר חודשי</TableCell>
                  <TableCell align="right">תאריך</TableCell>
                  <TableCell align="right">ערבים</TableCell>
                  <TableCell align="right">סטטוס</TableCell>
                  <TableCell align="right">פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow
                    key={req.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSelected(req.id)}
                  >
                    <TableCell align="right">
                      {req.user?.first_name} {req.user?.last_name}
                    </TableCell>
                    <TableCell align="right">{req.purpose || "-"}</TableCell>
                    <TableCell align="right">{req.amount}</TableCell>
                    <TableCell align="right">{req.monthly_payment}</TableCell>
                    <TableCell align="right">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString("he-IL")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {req.guarantor_requests?.length
                        ? req.guarantor_requests
                            .map(
                              (g) =>
                                `${g.guarantor.first_name} ${g.guarantor.last_name}`
                            )
                            .join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          color:
                            statusMap[req.status]?.color ?? "text.secondary",
                          fontWeight: 600,
                        }}
                      >
                        {statusMap[req.status]?.label ?? req.status}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        disabled={req.status !== "ADMIN_PENDING"}
                        onClick={() => openCheckModal(req.id)}
                      >
                        אישור
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {checkOpen && checkLoan && (
          <CheckLoanModal
            loan={checkLoan}
            type="update"
            onClose={() => {
              setCheckOpen(false);
              setCheckLoan(null);
              setApproveId(null);
            }}
            onSubmit={async () => {
              if (!approveId) return;
              await dispatch(adminApproveRequest(approveId)).unwrap();
              setCheckOpen(false);
              setCheckLoan(null);
              setApproveId(null);
            }}
          />
        )}
        <Dialog
          open={Boolean(selectedRequest)}
          onClose={() => setSelected(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>פרטי בקשה</DialogTitle>
          <DialogContent>
            {!selectedRequest && null}
            {selectedRequest && (
              <Stack spacing={1}>
                <Typography fontWeight={700}>
                  {selectedRequest.user?.first_name}{" "}
                  {selectedRequest.user?.last_name}
                </Typography>
                <Typography>סכום: {selectedRequest.amount}</Typography>
                <Typography>החזר חודשי: {selectedRequest.monthly_payment}</Typography>
                <TextField
                  label="מטרה"
                  value={editPurpose}
                  onChange={(e) => setEditPurpose(e.target.value)}
                  fullWidth
                  disabled={!canEditRequest}
                />
                <TextField
                  label="יום חיוב (1-28)"
                  type="number"
                  value={editPaymentDate}
                  onChange={(e) => setEditPaymentDate(Number(e.target.value))}
                  fullWidth
                  disabled={!canEditRequest}
                />
                <FormControl fullWidth>
                  <InputLabel>אמצעי חיוב</InputLabel>
                  <Select
                    value={editPaymentMethod}
                    label="אמצעי חיוב"
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    disabled={!canEditRequest}
                  >
                    <MenuItem value="direct_debit">הוראת קבע</MenuItem>
                    <MenuItem value="credit_card">כרטיס אשראי</MenuItem>
                    <MenuItem value="bank_transfer">העברה בנקאית</MenuItem>
                    <MenuItem value="cash">מזומן</MenuItem>
                    <MenuItem value="other">אחר</MenuItem>
                  </Select>
                </FormControl>
                <Typography>סטטוס: {selectedRequest.status}</Typography>
                <Typography>
                  ערבים: {guarantorNames.length ? guarantorNames.join(", ") : "-"}
                </Typography>
                {selectedRequest.error_message && (
                  <Typography color="error">
                    {selectedRequest.error_message}
                  </Typography>
                )}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    disabled={!canEditRequest}
                    onClick={() =>
                      dispatch(
                        updateLoanRequestDetails({
                          id: selectedRequest.id,
                          purpose: editPurpose,
                          payment_date: Number(editPaymentDate),
                          payment_method: editPaymentMethod,
                        })
                      )
                    }
                  >
                    שמירת פרטים
                  </Button>
                  <Button
                    variant="contained"
                    disabled={selectedRequest.status !== "ADMIN_PENDING"}
                    onClick={() => openCheckModal(selectedRequest.id)}
                  >
                    אישור
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={selectedRequest.status !== "ADMIN_PENDING"}
                    onClick={() => dispatch(adminRejectRequest({ id: selectedRequest.id }))}
                  >
                    דחייה
                  </Button>
                </Stack>
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LoanRequestsPage;
