import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
      Dialog,
      DialogActions,
      DialogContent,
      DialogTitle,
      Button,
  Stack,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../../../../store/store";
import { InvestmentDto } from "../InvestmentDto";
import GeneralInvestmentInfoCard from "../InvestmentDetails/GeneralInvestmentInfoCard";
import ConfirmModal from "../../genricComponents/confirmModal";
import {
  deleteInvestmentById,
  updateInvestmentById,
} from "../../../../store/features/admin/adminInvestmentsSlice";

interface InvestmentMiniCardProps {
  investment: InvestmentDto;
  selected?: boolean;
  onSelect?: () => void;
  onOpenAction?: () => void;
  onActionSuccess?: () => void;
}

const toInputDate = (value?: Date | string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const InvestmentMiniCard: React.FC<InvestmentMiniCardProps> = ({
  investment,
  selected,
  onSelect,
  onOpenAction,
  onActionSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const [editOpen, setEditOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [form, setForm] = useState({
    investment_name: "",
    investment_by: "",
    company_name: "",
    investment_portfolio_number: "",
    start_date: "",
  });

  useEffect(() => {
    setForm({
      investment_name: investment.investment_name ?? "",
      investment_by: investment.investment_by ?? "",
      company_name: investment.company_name ?? "",
      investment_portfolio_number: investment.investment_portfolio_number ?? "",
      start_date: toInputDate(investment.start_date),
    });
  }, [investment]);

  const onDelete = async () => {
    try {
      await toast.promise(dispatch(deleteInvestmentById(investment.id)).unwrap(), {
        pending: "מוחק השקעה...",
        success: "ההשקעה נמחקה.",
        error: "מחיקת ההשקעה נכשלה.",
      });
      onActionSuccess?.();
    } finally {
      setDeleteMode(false);
    }
  };

  const onSave = async () => {
    try {
      await toast.promise(
        dispatch(
          updateInvestmentById({
            id: investment.id,
            investment_name: form.investment_name.trim(),
            investment_by: form.investment_by.trim(),
            company_name: form.company_name.trim(),
            investment_portfolio_number: form.investment_portfolio_number.trim(),
            start_date: form.start_date ? (new Date(form.start_date) as Date) : undefined,
          })
        ).unwrap(),
        {
          pending: "מעדכן השקעה...",
          success: "ההשקעה עודכנה.",
          error: "עדכון ההשקעה נכשל.",
        }
      );
      setEditOpen(false);
      onActionSuccess?.();
    } catch {
      // handled by toast.promise
    }
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
        <Box display="flex" alignItems="center" gap={1} sx={{ direction: "rtl" }}>
          <Box textAlign="right" flex={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              השקעה #{investment.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {investment.investment_name}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="flex-end" flex={1}>
            <Chip
              label={investment.is_active ? "פעיל" : "לא פעיל"}
              size="small"
              sx={{
                backgroundColor: investment.is_active ? "#D2F7E1" : "#F0F0F0",
                color: investment.is_active ? "#28A960" : "#6B6B6B",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </Box>

        <Box mt={1} display="flex" justifyContent="space-between" sx={{ direction: "rtl" }}>
          <Typography variant="caption" color="text.secondary">
            שווי נוכחי
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#006CF0">
            ₪{Number(investment.current_value ?? 0).toLocaleString("he-IL")}
          </Typography>
        </Box>
        <Box mt={1} display="flex" justifyContent="space-between" sx={{ direction: "rtl" }}>
          <Typography variant="caption" color="text.secondary">
            סך קרן
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#D35400">
            ₪{Number(investment.total_principal_invested ?? 0).toLocaleString("he-IL")}
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
                    onSelect?.();
                    onOpenAction?.();
                  }}
                  disabled={!investment.is_active}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="פרטי השקעה">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
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

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <GeneralInvestmentInfoCard investment={investment} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>עריכת השקעה</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="שם השקעה"
              value={form.investment_name}
              onChange={(e) => setForm((p) => ({ ...p, investment_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="השקעה דרך"
              value={form.investment_by}
              onChange={(e) => setForm((p) => ({ ...p, investment_by: e.target.value }))}
              fullWidth
            />
            <TextField
              label="חברת השקעה"
              value={form.company_name}
              onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="מספר תיק השקעה"
              value={form.investment_portfolio_number}
              onChange={(e) =>
                setForm((p) => ({ ...p, investment_portfolio_number: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="תאריך השקעה ראשוני"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={onSave}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      {deleteMode && canWrite && (
        <ConfirmModal
          open={deleteMode}
          onClose={() => setDeleteMode(false)}
          onSubmit={onDelete}
          text="למחוק את ההשקעה?"
        />
      )}
    </Card>
  );
};

export default InvestmentMiniCard;
