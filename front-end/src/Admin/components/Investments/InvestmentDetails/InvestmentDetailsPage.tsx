import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "../../../../store/store";
import LoadingIndicator from "../../StatusComponents/LoadingIndicator";
import GeneralInvestmentInfoCard from "./GeneralInvestmentInfoCard";
import InvestmentAction from "./InvestmentAction";
import InvestmentActionTable from "./InvestmentActionTable";
import {
  deleteInvestmentById,
  getAllInvestments,
  getTransactionsByInvestmentId,
  updateInvestmentById,
} from "../../../../store/features/admin/adminInvestmentsSlice";

const toInputDate = (value?: Date | string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const InvestmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const investmentId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const investment = useSelector((s: RootState) =>
    s.AdminInvestmentsSlice.allInvestments.find((inv) => inv.id === investmentId)
  );
  const investmentTransactionDetails = useSelector(
    (s: RootState) => s.AdminInvestmentsSlice.investmentTransactions
  );

  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    investment_name: "",
    investment_by: "",
    company_name: "",
    investment_portfolio_number: "",
    start_date: "",
  });

  useEffect(() => {
    if (investmentId) {
      dispatch(getTransactionsByInvestmentId(investmentId));
    }
  }, [dispatch, investmentId]);

  useEffect(() => {
    if (!investment) return;
    setForm({
      investment_name: investment.investment_name ?? "",
      investment_by: investment.investment_by ?? "",
      company_name: investment.company_name ?? "",
      investment_portfolio_number: investment.investment_portfolio_number ?? "",
      start_date: toInputDate(investment.start_date),
    });
  }, [investment]);

  if (!investment || !investmentTransactionDetails) return <LoadingIndicator />;

  const handleInvestmentChanged = () => {
    if (investmentId) {
      dispatch(getTransactionsByInvestmentId(investmentId));
      dispatch(getAllInvestments());
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateInvestmentById({
          id: investmentId,
          investment_name: form.investment_name.trim(),
          investment_by: form.investment_by.trim(),
          company_name: form.company_name.trim(),
          investment_portfolio_number: form.investment_portfolio_number.trim(),
          start_date: form.start_date ? (new Date(form.start_date) as Date) : undefined,
        })
      ).unwrap();
      await dispatch(getAllInvestments()).unwrap();
      setEditOpen(false);
      toast.success("ההשקעה עודכנה בהצלחה");
    } catch {
      toast.error("שגיאה בעדכון השקעה");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteInvestmentById(investmentId)).unwrap();
      setDeleteOpen(false);
      toast.success("ההשקעה נמחקה בהצלחה");
      navigate("/investments");
    } catch {
      toast.error("שגיאה במחיקת השקעה");
    }
  };

  return (
    <Box
      sx={{
        pt: 2,
        px: { xs: 2, md: 4 },
        pb: 5,
        minHeight: "100vh",
        direction: "rtl",
      }}
    >
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon sx={{ ml: 1 }} />}
        sx={{
          mb: 2,
          color: "#555",
          bgcolor: "#F5F7FA",
          "&:hover": { backgroundColor: "rgba(0,0,0,.04)" },
        }}
      >
        חזור לדף השקעות
      </Button>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        {canWrite && (
          <>
            <Button
              variant="contained"
              onClick={() => setActionsOpen(true)}
              disabled={!investment.is_active}
              sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
            >
              פעולות להשקעה
            </Button>
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              עריכת השקעה
            </Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
              מחיקת השקעה
            </Button>
          </>
        )}
      </Box>

      <Divider />
      <Grid
        container
        spacing={4}
        direction={{ xs: "column", md: "row-reverse" }}
        justifyContent={{ xs: "flex-start", md: "space-between" }}
        alignItems="flex-start"
        sx={{ mt: 3 }}
      >
        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "40%" } }}>
          <GeneralInvestmentInfoCard investment={investment} />
        </Grid>

        <Grid item xs={12} md={4}>
          <InvestmentActionTable actions={investmentTransactionDetails} title="פעולות על השקעה" />
        </Grid>
      </Grid>

      <Dialog
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <DialogContent sx={{ p: 0, background: "transparent" }}>
          <InvestmentAction
            investmentId={investmentId}
            onChanged={() => {
              setActionsOpen(false);
              handleInvestmentChanged();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
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
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={handleSave}>
            שמירה
          </Button>
        </Box>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>מחיקת השקעה</DialogTitle>
        <DialogContent>האם למחוק את ההשקעה לצמיתות?</DialogContent>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>ביטול</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            מחיקה
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default InvestmentDetailsPage;

