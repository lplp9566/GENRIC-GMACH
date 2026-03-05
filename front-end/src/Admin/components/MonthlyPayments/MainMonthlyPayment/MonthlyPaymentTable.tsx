import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { IMonthlyPayment, paymentMethod } from "../MonthlyPaymentsDto";
import { fmtDate } from "../../../../common/genricFunction";
import { useEffect, useMemo, useState } from "react";
import MonthlyPaymentEditModal from "./MonthlyPaymentEditModal";
import ConfirmModal from "../../genricComponents/confirmModal";
import { toast } from "react-toastify";
import { deleteMonthlyPayment } from "../../../../store/features/admin/adminMonthlyPayments";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { AddPaymentModal } from "../AddMonthlyPayment/AddMonthlyPayment";
import { setMonthlyPaymentModalMode } from "../../../../store/features/Main/AppMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type { SelectChangeEvent } from "@mui/material/Select";

interface MonthlyPaymentProps {
  paymentsThisMonth: IMonthlyPayment[];
}
const MonthlyPaymentTable: React.FC<MonthlyPaymentProps> = ({
  paymentsThisMonth,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);

  const isAdmin = Boolean(authUser?.is_admin);
  const [selectedPayment, setSelectedPayment] =
    useState<IMonthlyPayment | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [copyMode, setcopyMode] = useState(false);
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");
  const modalOpen = useSelector(
    (s: RootState) => s.mapModeSlice.MonthlyPaymentModalMode
  );

  useEffect(() => {
    if (!modalOpen) {
      setcopyMode(false);
    }
  }, [modalOpen]);
  const onDelete = async () => {
    const promise = dispatch(
      deleteMonthlyPayment(Number(selectedPayment!.id))
    ).unwrap();

    toast.promise(promise, {
      pending: "ממתין...",
      success: "התשלום נמחק בהצלחה! 👌",
      error: "שגיאה במחיקת התשלום 💥",
    });
    setDeleteMode(false);
  };

  const handleRowsLimitChange = (event: SelectChangeEvent) => {
    setRowsLimit(event.target.value as "10" | "30" | "all");
  };

  const sortedPayments = useMemo(() => {
    const copy = [...paymentsThisMonth];
    copy.sort((a, b) => {
      const ta = new Date(a.deposit_date).getTime();
      const tb = new Date(b.deposit_date).getTime();
      return tb - ta;
    });
    return copy;
  }, [paymentsThisMonth]);

  const displayedPayments = useMemo(() => {
    if (rowsLimit === "all") return sortedPayments;
    return sortedPayments.slice(0, Number(rowsLimit));
  }, [rowsLimit, sortedPayments]);

  return (
    <Box>
      <Paper sx={{ borderRadius: 2, overflow: "auto", padding: 2, boxShadow: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1}
          sx={{ mb: 1 }}
        >
          <Box />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
            <InputLabel id="monthly-payments-limit-label">תצוגה</InputLabel>
            <Select
              labelId="monthly-payments-limit-label"
              label="תצוגה"
              value={rowsLimit}
              onChange={handleRowsLimitChange}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="30">30</MenuItem>
              <MenuItem value="all">הכל</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell align="right">משתמש</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">אמצעי תשלום</TableCell>
              <TableCell align="right">הערות</TableCell>
              {isAdmin && <TableCell align="right">פעולות</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedPayments.length > 0 ? (
              displayedPayments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell align="right">
                    {p.user.first_name} {p.user.last_name}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "success.main", fontWeight: 600 }}
                  >
                    ₪{p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{fmtDate(p.deposit_date)}</TableCell>
                  <TableCell align="right">
                    {
                      paymentMethod.find((pm) => pm.value == p.payment_method)
                        ?.label
                    }
                  </TableCell>
                  <TableCell align="right">{p.description}</TableCell>
                  {isAdmin && (
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="עריכת תשלום">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedPayment(p);
                            setEditMode(true);
                          }}
                        >
                          <EditIcon
                            sx={{ color: "primary.main" }}
                            onClick={() => {
                              setSelectedPayment(p);
                              setEditMode(true);
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="העתקת פעולה">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedPayment(p);
                            setcopyMode(true);
                            dispatch(setMonthlyPaymentModalMode(true));
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>

                      {/* מחיקה */}
                      <Tooltip title="מחיקת תשלום">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => {
                            setSelectedPayment(p);
                            setDeleteMode(true);
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  אין הוראות קבע לתקופה זו
                </TableCell>
              </TableRow>
            )}
            {editMode && selectedPayment && (
              <MonthlyPaymentEditModal
                editMode={editMode}
                onClose={() => setEditMode(false)}
                selectedPayment={selectedPayment!}
              />
            )}
            {deleteMode && (
              <ConfirmModal
                onClose={() => setDeleteMode(false)}
                open={deleteMode}
                onSubmit={onDelete}
                text={"האם ברצונך למחוק את התשלום?"}
              />
            )}
            {copyMode && selectedPayment && (
              <AddPaymentModal
                cape={true}
                userDto={{
                  userid: selectedPayment.user.id,
                  amount: Number(selectedPayment.amount),
                  depositDate: selectedPayment.deposit_date.slice(0, 10),
                  method: selectedPayment.payment_method,
                  description: selectedPayment.description ?? "",
                }}
              />
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default MonthlyPaymentTable;
