import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { formatILS } from "../../Admin/components/HomePage/HomePage";
import { formatDate, parseDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { getUserFinancialsByUserGuard } from "../../store/features/user/userFinancialSlice";
import { getAllLoans } from "../../store/features/admin/adminLoanSlice";
import { StatusGeneric } from "../../common/indexTypes";
import { editUser } from "../../store/features/admin/adminUsersSlice";

const UserProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userFinancials = useSelector(
    (s: RootState) => s.UserFinancialSlice.data
  );
  const allLoans = useSelector((s: RootState) => s.AdminLoansSlice.allLoans);

  const user = authUser?.user;
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState(() => ({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email_address: user?.email_address ?? "",
    id_number: user?.id_number ?? "",
    phone_number: user?.phone_number ?? "",
    bank_number: user?.payment_details?.bank_number ?? "",
    bank_branch: user?.payment_details?.bank_branch ?? "",
    bank_account_number: user?.payment_details?.bank_account_number ?? "",
  }));

  useEffect(() => {
    if (user?.id != null) {
      dispatch(getUserFinancialsByUserGuard());
      dispatch(getAllLoans({ status: StatusGeneric.ACTIVE, userId: user.id }));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email_address: user.email_address ?? "",
      id_number: user.id_number ?? "",
      phone_number: user.phone_number ?? "",
      bank_number: user.payment_details?.bank_number ?? "",
      bank_branch: user.payment_details?.bank_branch ?? "",
      bank_account_number: user.payment_details?.bank_account_number ?? "",
    });
  }, [user]);

  const totalDonations = userFinancials?.total_donations ?? 0;
  const loanBalances = user?.payment_details?.loan_balances ?? [];
  const totalLoansCount = allLoans.length;
  const totalLoansBalance = allLoans.reduce((sum, loan) => {
    const balance = loanBalances.find((lb) => lb.loanId === loan.id)?.balance || 0;
    return sum + Math.abs(balance);
  }, 0);
  const joinDate = formatDate(parseDate(user?.join_date));
  const bankInfo = useMemo(
    () => ({
      bank_number: user?.payment_details?.bank_number ?? "לא הוגדר",
      bank_branch: user?.payment_details?.bank_branch ?? "לא הוגדר",
      bank_account_number:
        user?.payment_details?.bank_account_number ?? "לא הוגדר",
    }),
    [user?.payment_details]
  );

  const handleSave = () => {
    if (!user?.id) return;
    dispatch(
      editUser({
        userId: user.id,
        userData: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email_address: formData.email_address,
          id_number: formData.id_number,
          phone_number: formData.phone_number,
          payment_details: {
            bank_number: Number(formData.bank_number) || 0,
            bank_branch: Number(formData.bank_branch) || 0,
            bank_account_number: Number(formData.bank_account_number) || 0,
          } as any,
        },
      })
    );
    setEditOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4, md: 6 },
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
        background: isDark
          ? "radial-gradient(circle at 15% 15%, rgba(59,130,246,0.2), transparent 40%), linear-gradient(180deg, #0b1120 0%, #0f172a 70%)"
          : "radial-gradient(circle at 15% 15%, rgba(59,130,246,0.12), transparent 40%), linear-gradient(180deg, #f8fafc 0%, #ffffff 70%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(130deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))"
            : "linear-gradient(130deg, rgba(30,41,59,0.08), rgba(226,232,240,0.6))",
          border: isDark ? "1px solid rgba(148,163,184,0.2)" : "none",
        }}
      >
        <Stack spacing={1}>
          <Chip
            label="איזור אישי"
            sx={{
              alignSelf: "flex-start",
              fontWeight: 700,
              bgcolor: isDark ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.08)",
            }}
          />
          <Typography variant="h4" fontWeight={800}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            סיכום פרטים אישיים וסטטיסטיקות מצטברות.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              פרטי משתמש
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {[
                { label: "מספר זהות", value: user?.id_number ?? "לא הוגדר" },
                { label: "טלפון", value: user?.phone_number ?? "לא הוגדר" },
                { label: "אימייל", value: user?.email_address ?? "לא הוגדר" },
                { label: "תאריך הצטרפות", value: joinDate || "לא הוגדר" },
                { label: "סוג חברות", value: user?.membership_type ?? "לא הוגדר" },
              ].map((row) => (
                <Stack
                  key={row.label}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              פרטי בנק
            </Typography>
            <Stack spacing={1.2}>
              {[
                { label: "מספר בנק", value: bankInfo.bank_number },
                { label: "מספר סניף", value: bankInfo.bank_branch },
                { label: "מספר חשבון", value: bankInfo.bank_account_number },
              ].map((row) => (
                <Stack
                  key={row.label}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Box mt={2}>
              <Button
                variant="outlined"
                onClick={() => setEditOpen(true)}
                sx={{ borderRadius: 3, fontWeight: 700 }}
              >
                עריכת פרטים
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              מדדים מצטברים
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: isDark
                    ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(30,41,59,0.9))"
                    : "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(220,252,231,0.7))",
                  border: isDark
                    ? "1px solid rgba(34,197,94,0.35)"
                    : "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  סה״כ תרמת לגמ״ח (מהקמה)
                </Typography>
                <Typography variant="h5" fontWeight={800} mt={0.5}>
                  {formatILS(totalDonations)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כולל דמי חבר ותרומות במערכת.
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: isDark
                    ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(30,41,59,0.9))"
                    : "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(224,242,254,0.7))",
                  border: isDark
                    ? "1px solid rgba(59,130,246,0.35)"
                    : "1px solid rgba(59,130,246,0.2)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  הלוואות במערכת
                </Typography>
                <Typography variant="h5" fontWeight={800} mt={0.5}>
                  {totalLoansCount} הלוואות
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  יתרה להחזר: {formatILS(totalLoansBalance)}
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: isDark
                    ? "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(30,41,59,0.9))"
                    : "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(255,228,230,0.7))",
                  border: isDark
                    ? "1px solid rgba(244,63,94,0.35)"
                    : "1px solid rgba(244,63,94,0.2)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  מדד ציון 3 שנים
                </Typography>
                <Typography variant="h5" fontWeight={800} mt={0.5}>
                  בקרוב
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  נגדיר יחד את החישוב בהמשך.
                </Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: "right" }}>עריכת פרטים אישיים</DialogTitle>
        <DialogContent sx={{ direction: "rtl" }}>
          <Stack spacing={2} mt={1}>
            <TextField
              label="שם פרטי"
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="שם משפחה"
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="מייל"
              value={formData.email_address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email_address: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="טלפון"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="מספר תעודת זהות"
              value={formData.id_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, id_number: e.target.value }))
              }
              fullWidth
            />
            <Divider />
            <TextField
              label="מספר בנק"
              value={formData.bank_number}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bank_number: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="מספר סניף"
              value={formData.bank_branch}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bank_branch: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="מספר חשבון"
              value={formData.bank_account_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bank_account_number: e.target.value,
                }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">
            ביטול
          </Button>
          <Button onClick={handleSave} variant="contained">
            שמירה
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfilePage;
