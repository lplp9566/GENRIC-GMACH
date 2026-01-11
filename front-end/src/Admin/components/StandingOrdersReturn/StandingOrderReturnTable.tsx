import { FC, useState } from "react";
import { IOrdersReturnDto } from "./ordersReturnDto";
import Paper from "@mui/material/Paper/Paper";
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { fmtDate } from "../../../common/genricFunction";
import ConfirmModal from "../genricComponents/confirmModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { AddPaymentDateModal } from "./PayOrderRetronModal";
import { RootState } from "../../../store/store";
import { useSelector } from "react-redux";

interface StandingOrderReturnTableProps {
  payments: IOrdersReturnDto[];
}
const StandingOrderReturnTable: FC<StandingOrderReturnTableProps> = ({

  payments,
}) => {
    const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);
  const [selectedPayment, setSelectedPayment] =
    useState<IOrdersReturnDto | null>(null);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [copyMode, setcopyMode] = useState(false);
  const [payModalMode, setPayModalMode] = useState<boolean>(false);
  console.log({copyMode},{editMode});
  
  const onDelete = async () => {
    // const promise = dispatch(
    //   deleteMonthlyPayment(Number(selectedPayment!.id))
    // ).unwrap();
    // toast.promise(promise, {
    //   pending: "ממתין...",
    //   success: "התשלום נמחק בהצלחה! 👌",
    //   error: "שגיאה במחיקת התשלום 💥",
    // });
    // setDeleteMode(false);
  };
  return (
    <div>
      {" "}
      <Paper
        sx={{ borderRadius: 2, overflow: "auto", padding: 2, boxShadow: 1 }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead >
            <TableRow>
              <TableCell align="right">משתמש</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">שולם</TableCell>
              <TableCell align="right">הערות</TableCell>
         {isAdmin && <TableCell align="right">פעולות</TableCell>}     
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((p) => (
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
                  <TableCell align="right">{fmtDate(p.date)}</TableCell>
                  <TableCell align="right">
                    {p.paid ? (
                      <>{p.paid_at ? fmtDate(p.paid_at) : "שולם"}</>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedPayment(p);
                          setPayModalMode(true);
                        }}
                      >
                        סמן כשולם
                      </Button>
                    )}
                  </TableCell>

                  <TableCell align="right">{p.note}</TableCell>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  אין הוראות קבע לתקופה זו
                </TableCell>
              </TableRow>
            )}
            {deleteMode && (
              <ConfirmModal
                onClose={() => setDeleteMode(false)}
                open={deleteMode}
                onSubmit={onDelete}
                text={"האם ברצונך למחוק את התשלום?"}
              />
            )}
            {/* {copyMode && selectedPayment && (
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
                )} */}
          </TableBody>
        </Table>
        {payModalMode && selectedPayment && (
          <AddPaymentDateModal
            open={payModalMode}
            onClose={() => setPayModalMode(false)}
            selectedPayment={selectedPayment}
            // onSubmit={(data) => handleMarkAsPaid(data.date)}
            // defaultDate={new Date().toISOString().slice(0, 10)}
          />
        )}
      </Paper>
    </div>
  );
};

export default StandingOrderReturnTable;
