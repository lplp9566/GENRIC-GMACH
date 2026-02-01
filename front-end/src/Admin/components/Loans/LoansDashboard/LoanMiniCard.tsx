import React, { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ILoanWithUser } from "../LoanDto";
import EditLoanModal from "./EtitLoanModal";
import ConfirmModal from "../../genricComponents/confirmModal";
import Actions from "../LoanActions/Actions";
import useLoanSubmit from "../../../Hooks/LoanHooks/LoanActionsHooks";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  deleteLoan,
  getLoanDetails,
} from "../../../../store/features/admin/adminLoanSlice";
import { GeneralLoanInfoCard } from "../LoanDetails/GeneralLoanInfoCard";
import LoadingIndicator from "../../StatusComponents/LoadingIndicator";

interface LoanMiniCardProps {
  loan: ILoanWithUser;
  selected?: boolean;
  onSelect?: () => void;
  onActionSuccess?: () => void;
}

const LoanMiniCard: React.FC<LoanMiniCardProps> = ({
  loan,
  selected,
  onSelect,
  onActionSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleSubmit = useLoanSubmit(loan.id, () => {
    setActionsOpen(false);
    onActionSuccess?.();
  });

  const onDelete = () => {
    toast.promise(dispatch(deleteLoan(Number(loan.id))).unwrap(), {
      pending: "מוחק הלוואה...",
      success: "ההלוואה נמחקה.",
      error: "מחיקת ההלוואה נכשלה.",
    });
    setDeleteMode(false);
    onActionSuccess?.();
  };

  return (
    <Card
      onClick={onSelect}
      sx={{
        borderRadius: 2,
        border: selected ? "2px solid #2a8c82" : "1px solid rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ direction: "rtl" }}
        >
          <Box textAlign="right">
            <Typography variant="subtitle2" fontWeight={700}>
              הלוואה #{loan.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(loan.user?.first_name ?? "").trim()}{" "}
              {(loan.user?.last_name ?? "").trim()}
            </Typography>
          </Box>
          <Chip
            label={loan.isActive ? "פעיל" : "לא פעיל"}
            size="small"
            sx={{
              backgroundColor: loan.isActive ? "#D2F7E1" : "#F0F0F0",
              color: loan.isActive ? "#28A960" : "#6B6B6B",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Box>



        <Box
          mt={0.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ direction: "rtl" }}
        >
          <Typography variant="caption" color="text.secondary">
            סכום הלוואה
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#006CF0">
            ₪{loan.loan_amount.toLocaleString("he-IL")}
          </Typography>
        </Box>
        <Box
          mt={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ direction: "rtl" }}
        >
          <Typography variant="caption" color="text.secondary">
            יתרה לתשלום
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#D35400">
            ₪{loan.remaining_balance.toLocaleString("he-IL")}
          </Typography>
        </Box>
        <Box
          mt={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ direction: "rtl" }}
        >
          {canWrite && (
            <Tooltip title="הוספת פעולה">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    setActionsOpen(true);
                  }}
                  disabled={!loan.isActive}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="פרטי הלוואה">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                dispatch(getLoanDetails(loan.id));
                setDetailsOpen(true);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canWrite && (
            <Tooltip title="עריכה">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canWrite && (
            <Tooltip title="מחיקה">
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteMode(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>

      {editOpen && canWrite && (
        <EditLoanModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          loan={loan}
        />
      )}

      {deleteMode && canWrite && (
        <ConfirmModal
          open={deleteMode}
          onClose={() => setDeleteMode(false)}
          onSubmit={onDelete}
          text="למחוק את ההלוואה?"
        />
      )}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {loanDetails?.id === loan.id ? (
            <GeneralLoanInfoCard loan={loanDetails} />
          ) : (
            <LoadingIndicator />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={actionsOpen && canWrite}
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
    </Card>
  );
};

export default LoanMiniCard;
