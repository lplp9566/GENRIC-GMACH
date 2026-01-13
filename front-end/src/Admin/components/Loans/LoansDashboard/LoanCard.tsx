// LoanCard.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Grid,
  IconButton,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Flag as PurposeIcon,
  AccountBalanceWallet as RemainingIcon,
} from "@mui/icons-material";
import { ILoanWithUser } from "../LoanDto";
import EditLoanModal from "./EtitLoanModal";
import ConfirmModal from "../../genricComponents/confirmModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { deleteLoan } from "../../../../store/features/admin/adminLoanSlice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import useLoanSubmit from "../../../Hooks/LoanHooks/LoanActionsHooks";
import Actions from "../LoanActions/Actions";

interface LoanCardProps {
  loan: ILoanWithUser;
  onClick: () => void;
  readOnly?: boolean;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onClick, readOnly }) => {
  const dispatch = useDispatch<AppDispatch>();

  const balancePositive = (loan.balance ?? 0) >= 0;
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<ILoanWithUser | null>(null);
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const handleSubmit = useLoanSubmit(loan.id);

  const onDelete = () => {
    toast.promise(dispatch(deleteLoan(Number(loan.id))).unwrap(), {
      pending: "מוחק הלוואה...",
      success: "ההלוואה נמחקה.",
      error: "מחיקת ההלוואה נכשלה.",
    });
    setDeleteMode(false);
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
    >
      <CardContent sx={{ pt: 2, pb: 3, px: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          sx={{ direction: "rtl" }}
        >
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary" mt={0.2}>
              הלוואה #{loan.id}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="#1C3C3C">
              {loan.purpose}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              {balancePositive ? (
                <TrendingUpIcon fontSize="small" sx={{ color: "#28A960" }} />
              ) : (
                <TrendingDownIcon fontSize="small" sx={{ color: "#D35400" }} />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                color={balancePositive ? "#28A960" : "#D35400"}
              >
                ₪{Math.abs(loan.balance ?? 0).toLocaleString()}
              </Typography>
            </Box>

            <Chip
              label={loan.isActive ? "פעיל" : "לא פעיל"}
              size="small"
              sx={{
                backgroundColor: loan.isActive ? "#D2F7E1" : "#F0F0F0",
                color: loan.isActive ? "#28A960" : "#6B6B6B",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}
            />

            {!readOnly && (
              <>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLoan(loan);
                    setEditOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLoan(loan);
                    setDeleteMode(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
            <PurposeIcon fontSize="small" sx={{ color: "#1C3C3C" }} />
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  מטרת ההלוואה
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#1C3C3C">
                  {loan.purpose}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
            <AttachMoneyIcon fontSize="small" sx={{ color: "#006CF0" }} />
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  סכום ההלוואה
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#006CF0">
                  ₪{loan.loan_amount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
            <CalendarTodayIcon fontSize="small" sx={{ color: "#28A960" }} />
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תאריך חיוב הבא
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#28A960">
                  {loan.payment_date} בחודש
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
            <AttachMoneyIcon fontSize="small" sx={{ color: "#28A960" }} />
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תשלום חודשי
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#28A960">
                  ₪{loan.monthly_payment.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
          <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
            <RemainingIcon fontSize="small" sx={{ color: "#D35400" }} />
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  יתרה לתשלום
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#D35400">
                  ₪{loan.remaining_balance.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center">
          <Button variant="outlined" onClick={onClick}>
            הצג פרטי הלוואה
          </Button>
          {!readOnly && (
            <Button
              variant="contained"
              onClick={() => setActionsOpen(true)}
              disabled={!loan.isActive}
              sx={{ ml: 1, bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
            >
              הוסף פעולה
            </Button>
          )}
        </Box>
      </CardContent>

      {!readOnly && selectedLoan && (
        <EditLoanModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          loan={selectedLoan}
        />
      )}
      {!readOnly && deleteMode && selectedLoan && (
        <ConfirmModal
          open={deleteMode}
          onClose={() => setDeleteMode(false)}
          onSubmit={onDelete}
          text="למחוק את ההלוואה?"
        />
      )}
      {!readOnly && (
        <Dialog
          open={actionsOpen}
          onClose={() => setActionsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent>
            <Actions
              loanId={loan.id}
              handleSubmit={handleSubmit}
              max={loan.remaining_balance}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default LoanCard;
