// EditLoanModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import { RtlProvider } from "../../../../Theme/rtl";

// ✅ תעדכן נתיב אם צריך
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { setLoanModalMode } from "../../../../store/features/Main/AppMode";
import CheckLoanModal from "../CheckLoanModal";
import { toast } from "react-toastify";
import { editLoan } from "../../../../store/features/admin/adminLoanSlice";
import { ICreateLoan, IEditLoan } from "../LoanDto";
import { useNavigate } from "react-router-dom";

// type UserOption = { id: number; first_name: string; last_name: string };

interface EditLoanModalProps {
  open: boolean;
  onClose: () => void;
  loan: {
    id: number;
    loan_amount: number;
    monthly_payment: number;
    payment_date: number;
    loan_date: string;
    purpose?: string;
    guarantor1?: string | null; // ✅ שם מלא
    guarantor2?: string | null; // ✅ שם מלא
  };
}
const toDateInput = (dateStr?: string) =>
  dateStr
    ? String(dateStr).slice(0, 10)
    : new Date().toISOString().slice(0, 10);

const numOr = (v: any, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const EditLoanModal: React.FC<EditLoanModalProps> = ({
  open,
  onClose,
  loan,
}) => {
  const [form, setForm] = useState<ICreateLoan>({
    user: loan.id,
    loan_amount: loan.loan_amount,
    loan_date: loan.loan_date,
    purpose: loan.purpose!,
    monthly_payment: loan.monthly_payment,
    payment_date: loan.payment_date,
    guarantor1: loan.guarantor1 ?? null,
    guarantor2: loan.guarantor2 ?? null,
    
  });
  const { LoanModalMode } = useSelector(
    (state: RootState) => state.mapModeSlice
  );
  const allUsers = useSelector((state: RootState) => state.AdminUsers.allUsers);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();


  const [guarantorIds, setGuarantorIds] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!open) return;
    const g1Id =
      allUsers.find(
        (u) => `${u.first_name} ${u.last_name}` === (loan.guarantor1 ?? "")
      )?.id ?? 0;

    const g2Id =
      allUsers.find(
        (u) => `${u.first_name} ${u.last_name}` === (loan.guarantor2 ?? "")
      )?.id ?? 0;

    setGuarantorIds([g1Id, g2Id]);

    setForm((p) => ({
      ...p,
      guarantor1: loan.guarantor1 ?? "",
      guarantor2: loan.guarantor2 ?? "",
    }));
  }, [open, loan.guarantor1, loan.guarantor2]);

  const onGuarantorChange = (idx: 0 | 1, userId: number) => {
    setGuarantorIds((prev) => {
      const copy: [number, number] = [...prev] as any;
      copy[idx] = userId || 0;
      return copy;
    });

    // ללא
    if (!userId || userId === 0) {
      setForm((p) => ({
        ...p,
        guarantor1: idx === 0 ? "" : p.guarantor1 ?? "",
        guarantor2: idx === 1 ? "" : p.guarantor2 ?? "",
      }));
      return;
    }

    const u = allUsers.find((u) => u.id === userId);
    if (!u) return;

    const fullName = `${u.first_name} ${u.last_name}`;

    setForm((p) => ({
      ...p,
      guarantor1: idx === 0 ? fullName : p.guarantor1 ?? "",
      guarantor2: idx === 1 ? fullName : p.guarantor2 ?? "",
    }));
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    const amount = numOr(form.loan_amount, 0);
    const monthly = numOr(form.monthly_payment, 0);
    const day = numOr(form.payment_date, 0);

    if (!amount || amount <= 0) e.loan_amount = "חובה סכום גדול מ־0";
    if (!monthly || monthly <= 0)
      e.monthly_payment = "חובה תשלום חודשי גדול מ־0";
    if (!day || day < 1 || day > 31)
      e.payment_date = "יום תשלום חייב להיות בין 1 ל־31";
    if (!form.loan_date) e.loan_date = "חובה תאריך";

    // אופציונלי: למנוע אותו ערב פעמיים
    if (
      guarantorIds[0] &&
      guarantorIds[1] &&
      guarantorIds[0] === guarantorIds[1]
    ) {
      e.guarantors = "לא ניתן לבחור את אותו ערב פעמיים";
    }

    return e;
  }, [form, guarantorIds]);
const checkAmount = useMemo(() => {
  const delta = numOr(form.loan_amount, 0) - loan.loan_amount;
  return Math.max(0, delta);
}, [form.loan_amount, loan.loan_amount]);
const loanForCheck = useMemo(() => ({
  ...form,
  loan_amount: checkAmount,
}), [form, checkAmount]);


  const isDirty = useMemo(() => {
    return (
      numOr(form.loan_amount, 0) !== loan.loan_amount ||
      numOr(form.monthly_payment, 0) !== loan.monthly_payment ||
      numOr(form.payment_date, 0) !== loan.payment_date ||
      toDateInput(form.loan_date) !== toDateInput(loan.loan_date) ||
      (form.purpose ?? "") !== (loan.purpose ?? "") ||
      (form.guarantor1 ?? "") !== (loan.guarantor1 ?? "") ||
      (form.guarantor2 ?? "") !== (loan.guarantor2 ?? "")
    );
  }, [form, loan]);

  const canSubmit = Object.keys(errors).length === 0 && isDirty ;

  const buildEditPayload = (): IEditLoan => ({
    loan: loan.id,
    loan_amount: numOr(form.loan_amount, loan.loan_amount),
    monthly_payment: numOr(form.monthly_payment, loan.monthly_payment),
    payment_date: numOr(form.payment_date, loan.payment_date),
    loan_date: form.loan_date,
    purpose: form.purpose?.trim() || "",
    guarantor1: (form.guarantor1 ?? "").trim() || "",
    guarantor2: (form.guarantor2 ?? "").trim() || "",
  });

  const doEdit = async () => {
    const payload = buildEditPayload();
    toast.promise(dispatch(editLoan(payload)).unwrap(), {
      pending: "מעדכן הלוואה...",
      success: "הלוואה עודכנה בהצלחה",
      error: "שגיאה בעדכון הלוואה",
    });
    onClose();
    navigate("/loans");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    // אם הגדלת סכום -> רק פותחים מודאל, לא שולחים עדיין
    if (numOr(form.loan_amount, 0) > loan.loan_amount) {
      dispatch(setLoanModalMode(true));
      return;
    }

    // אחרת שולחים רגיל
    await doEdit();
  };

  return (
    <RtlProvider>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
            bgcolor: "#e8f5e9",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            bgcolor: "green",
            color: "#fff",
            py: 2.5,
            textAlign: "center",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
         {LoanModalMode && (
  <CheckLoanModal
    onClose={() => dispatch(setLoanModalMode(false))}
    loan={loanForCheck}
    type="update"
    onSubmit={async () => {
        console.log("hgh");
        
      dispatch(setLoanModalMode(false));
      await doEdit(); 
    }}
  />
)}
          <Typography variant="h6" sx={{ fontWeight: 800, m: 0 }}>
            עריכת הלוואה #{loan.id}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            ערוך את השדות הנדרשים
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 3,
              border: "1px solid #c8e6c9",
              bgcolor: "rgba(255,255,255,0.45)",
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}
            >
              שדות חובה: סכום, תשלום חודשי, יום תשלום, תאריך
            </Typography>
          </Box>

          <Grid container spacing={2.2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="סכום (₪)*"
                type="number"
                fullWidth
                color="success"
                value={form.loan_amount ?? ""}
                error={!!errors.loan_amount}
                helperText={errors.loan_amount}
                inputProps={{ min: 1 }}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    loan_amount: Number(e.target.value),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="תשלום חודשי (₪)*"
                type="number"
                fullWidth
                color="success"
                value={form.monthly_payment ?? ""}
                error={!!errors.monthly_payment}
                helperText={errors.monthly_payment}
                inputProps={{ min: 1 }}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    monthly_payment: Number(e.target.value),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="יום תשלום בחודש*"
                type="number"
                fullWidth
                color="success"
                value={form.payment_date ?? ""}
                error={!!errors.payment_date}
                helperText={errors.payment_date}
                inputProps={{ min: 1, max: 31 }}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    payment_date: Number(e.target.value),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="תאריך הלוואה*"
                type="date"
                fullWidth
                color="success"
                InputLabelProps={{ shrink: true }}
                value={toDateInput(form.loan_date)}
                error={!!errors.loan_date}
                helperText={errors.loan_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, loan_date: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="מטרה"
                fullWidth
                color="success"
                value={form.purpose ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, purpose: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <SelectAllUsers
                filter="all"
                label="ערב 1"
                value={guarantorIds[0]}
                onChange={(id) => onGuarantorChange(0, id)}
                color="success"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <SelectAllUsers
                filter="members"
                label="ערב 2"
                value={guarantorIds[1]}
                onChange={(id) => onGuarantorChange(1, id)}
                color="success"
              />
            </Grid>

            {!!errors.guarantors && (
              <Grid item xs={12}>
                <Typography
                  sx={{ color: "error.main", fontWeight: 700, fontSize: 13 }}
                >
                  {errors.guarantors}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            pb: 3,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={onClose} >
            ביטול
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!canSubmit}
            sx={{
              bgcolor: "green",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#115293" },
            }}
          >
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};

export default EditLoanModal;
