import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { IMonthlyPayment, paymentMethod } from "../MonthlyPaymentsDto";
import { fmtDate } from "../../../../common/genricFunction";
import { useState } from "react";
import MonthlyPaymentEditModal from "./MonthlyPaymentEditModal";
import ConfirmModal from "../../genricComponents/confirmModal";
import { toast } from "react-toastify";
import { deleteMonthlyPayment } from "../../../../store/features/admin/adminMonthlyPayments";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
interface MonthlyPaymentProps {
  paymentsThisMonth: IMonthlyPayment[];
}
const MonthlyPaymentTable: React.FC<MonthlyPaymentProps> = ({
  paymentsThisMonth,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedPayment, setSelectedPayment] =
    useState<IMonthlyPayment | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);

  const onDelete = async () => {
    console.log(selectedPayment);

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
  return (
    <div>
      {" "}
      <Paper
        sx={{ borderRadius: 2, overflow: "auto", padding: 2, boxShadow: 1 }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell align="right">משתמש</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">אמצעי תשלום</TableCell>
              <TableCell align="right">הערות</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentsThisMonth.length > 0 ? (
              paymentsThisMonth.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  onClick={() => {
                    setSelectedPayment(p);
                    setEditMode(true);
                  }}
                >
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
                  <TableCell
                    align="center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPayment(p);
                      setDeleteMode(true);
                    }}
                  >
                    <Tooltip title="מחיקת תשלום">
                      <IconButton color="error" size="small">
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default MonthlyPaymentTable;
