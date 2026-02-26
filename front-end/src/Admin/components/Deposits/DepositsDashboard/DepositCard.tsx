import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { IDeposit, IDepositActionCreate } from "../depositsDto";
import DepositsActions from "../DepositsAction/DepositsActions";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../store/store";
import { createDepositAction } from "../../../../store/features/admin/adminDepositsSlice";

interface DepositCardProps {
  deposit: IDeposit;
  onClick: () => void;
  readOnly?: boolean;
  compactActions?: boolean;
  onAddAction?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DepositCard: React.FC<DepositCardProps> = ({
  deposit,
  onClick,
  readOnly,
  compactActions,
  onAddAction,
  onView,
  onEdit,
  onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [actionsOpen, setActionsOpen] = useState(false);

  const handleSubmit = useCallback(
    async (dto: IDepositActionCreate) => {
      await dispatch(createDepositAction(dto)).unwrap();
      setActionsOpen(false);
    },
    [dispatch]
  );

  const userName = `${deposit.user?.first_name ?? ""} ${deposit.user?.last_name ?? ""}`.trim();
  const depositTitle = userName ? `הפקדה #${deposit.id} • ${userName}` : `הפקדה #${deposit.id}`;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
    >
      <CardContent sx={{ pt: 2, pb: 3, px: 3, direction: "rtl" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box textAlign="right">
            <Typography variant="subtitle1" fontWeight={700} color="#E6F4FF">
              {depositTitle}
            </Typography>
          </Box>

          <Chip
            label={deposit.isActive ? "פעיל" : "לא פעיל"}
            size="small"
            sx={{
              backgroundColor: deposit.isActive ? "#D2F7E1" : "#F0F0F0",
              color: deposit.isActive ? "#28A960" : "#6B6B6B",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          />
        </Box>

        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
              <AccountBalanceIcon fontSize="small" sx={{ color: "#006CF0" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  סכום הפקדה
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#006CF0">
                  ₪{deposit.initialDeposit.toLocaleString("he-IL")}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
              <AccountBalanceWalletIcon fontSize="small" sx={{ color: "#28A960" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  יתרה נוכחית
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#28A960">
                  ₪{deposit.current_balance.toLocaleString("he-IL")}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
              <CalendarTodayIcon fontSize="small" sx={{ color: "#7CCBFF" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תאריך התחלה
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#BFE6FF">
                  {deposit.start_date
                    ? new Date(deposit.start_date).toLocaleDateString("he-IL")
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexDirection: "row-reverse" }}>
              <EventIcon fontSize="small" sx={{ color: "#D35400" }} />
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  תאריך סיום
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#D35400">
                  {deposit.end_date
                    ? new Date(deposit.end_date).toLocaleDateString("he-IL")
                    : "-"}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {compactActions ? (
          <Box
            mt={1}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ direction: "rtl" }}
          >
            {!readOnly && (
              <Tooltip title="הוספת פעולה">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onAddAction) return onAddAction();
                      setActionsOpen(true);
                    }}
                    disabled={!deposit.isActive}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="פרטי הפקדה">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  if (onView) return onView();
                  onClick();
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {!readOnly && (
              <Tooltip title="עריכה">
                <span>
                  <IconButton
                    size="small"
                    disabled={!deposit.isActive}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.();
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {!readOnly && (
              <Tooltip title="מחיקה">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={!deposit.isActive}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete?.();
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" gap={1}>
            <Button variant="outlined" onClick={onClick}>
              הצג פרטי הפקדה
            </Button>
            {!readOnly && (
              <Button
                variant="contained"
                onClick={() => setActionsOpen(true)}
                disabled={!deposit.isActive}
                sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
              >
                הוסף פעולה
              </Button>
            )}
          </Box>
        )}
      </CardContent>

      {!readOnly && (
        <Dialog open={actionsOpen} onClose={() => setActionsOpen(false)} maxWidth="sm" fullWidth>
          <DialogContent>
            <DepositsActions
              depositId={deposit.id}
              max={deposit.current_balance ?? 0}
              handleSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default DepositCard;
