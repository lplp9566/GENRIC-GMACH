import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
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

interface MonthlyPaymentProps {
  paymentsThisMonth: IMonthlyPayment[];
  rowsLimit: "10" | "30" | "all";
}

type SortField = "user" | "amount" | "date" | "payment_method";
type SortDirection = "asc" | "desc";

const MonthlyPaymentTable: React.FC<MonthlyPaymentProps> = ({
  paymentsThisMonth,
  rowsLimit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);

  const isAdmin = Boolean(authUser?.is_admin);
  const [selectedPayment, setSelectedPayment] =
    useState<IMonthlyPayment | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [copyMode, setcopyMode] = useState(false);
  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>("desc");

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
      success: "התשלום נמחק בהצלחה",
      error: "שגיאה במחיקת התשלום",
    });
    setDeleteMode(false);
  };

  const handleHeaderClick = (field: SortField) => {
    if (field === currentSortField) {
      setCurrentSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setCurrentSortField(field);
      setCurrentSortDirection("asc");
    }
  };

  const directionFor = (field: SortField): "asc" | "desc" =>
    currentSortField === field ? currentSortDirection : "asc";

  const sortedPayments = useMemo(() => {
    const copy = [...paymentsThisMonth];

    copy.sort((a, b) => {
      let cmp = 0;

      if (currentSortField === "date") {
        const ta = new Date(a.deposit_date).getTime();
        const tb = new Date(b.deposit_date).getTime();
        cmp = ta - tb;
      } else if (currentSortField === "amount") {
        cmp = Number(a.amount) - Number(b.amount);
      } else if (currentSortField === "payment_method") {
        const ma =
          paymentMethod.find((pm) => pm.value === a.payment_method)?.label ?? "";
        const mb =
          paymentMethod.find((pm) => pm.value === b.payment_method)?.label ?? "";
        cmp = ma.localeCompare(mb, "he");
      } else {
        const ua = `${a.user?.first_name ?? ""} ${a.user?.last_name ?? ""}`.trim();
        const ub = `${b.user?.first_name ?? ""} ${b.user?.last_name ?? ""}`.trim();
        cmp = ua.localeCompare(ub, "he");
      }

      return currentSortDirection === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [paymentsThisMonth, currentSortField, currentSortDirection]);

  const displayedPayments = useMemo(() => {
    if (rowsLimit === "all") return sortedPayments;
    return sortedPayments.slice(0, Number(rowsLimit));
  }, [rowsLimit, sortedPayments]);

  return (
    <Box>
      <Paper sx={{ borderRadius: 2, overflow: "auto", padding: 2, boxShadow: 1 }}>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell
                align="right"
                sortDirection={currentSortField === "user" ? currentSortDirection : false}
              >
                <TableSortLabel
                  active={currentSortField === "user"}
                  direction={directionFor("user")}
                  onClick={() => handleHeaderClick("user")}
                >
                  משתמש
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="right"
                sortDirection={currentSortField === "amount" ? currentSortDirection : false}
              >
                <TableSortLabel
                  active={currentSortField === "amount"}
                  direction={directionFor("amount")}
                  onClick={() => handleHeaderClick("amount")}
                >
                  סכום
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="right"
                sortDirection={currentSortField === "date" ? currentSortDirection : false}
              >
                <TableSortLabel
                  active={currentSortField === "date"}
                  direction={directionFor("date")}
                  onClick={() => handleHeaderClick("date")}
                >
                  תאריך
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="right"
                sortDirection={currentSortField === "payment_method" ? currentSortDirection : false}
              >
                <TableSortLabel
                  active={currentSortField === "payment_method"}
                  direction={directionFor("payment_method")}
                  onClick={() => handleHeaderClick("payment_method")}
                >
                  אמצעי תשלום
                </TableSortLabel>
              </TableCell>

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
                    {paymentMethod.find((pm) => pm.value == p.payment_method)?.label}
                  </TableCell>
                  <TableCell align="right">{p.description}</TableCell>
                  {isAdmin && (
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="עריכת תשלום">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedPayment(p);
                            setEditMode(true);
                          }}
                        >
                          <EditIcon sx={{ color: "primary.main" }} />
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
                  colSpan={isAdmin ? 6 : 5}
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
