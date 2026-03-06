import { useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import { useDispatch, useSelector } from "react-redux";
import { formatDate, parseDate } from "../../Admin/Hooks/genricFunction";
import { AppDispatch, RootState } from "../../store/store";
import { editUser } from "../../store/features/admin/adminUsersSlice";
import { setAuthUserData } from "../../store/features/auth/authSlice";
import { toast } from "react-toastify";
import { api } from "../../store/axiosInstance";
import ProfileHeaderCard from "./components/UserProfilePage/ProfileHeaderCard";
import ProfileInfoCard from "./components/UserProfilePage/ProfileInfoCard";
import EditProfileDialog from "./components/UserProfilePage/EditProfileDialog";
import EditNotificationsDialog from "./components/UserProfilePage/EditNotificationsDialog";
import { buildFullDisplayName, mapMembershipType } from "./components/UserProfilePage/utils";
import { NotificationFormData, ProfileFormData } from "./components/UserProfilePage/types";

const UserProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const authUser = useSelector((s: RootState) => s.authslice.user);

  const user = authUser?.user;

  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState(0);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email_address: user?.email_address ?? "",
    id_number: user?.id_number ?? "",
    birth_date: user?.birth_date ,
    phone_number: user?.phone_number ?? "",
    spouse_first_name: user?.spouse_first_name ?? "",
    spouse_last_name: user?.spouse_last_name ?? "",
    spouse_id_number: user?.spouse_id_number ?? "",
    spouse_birth_date: user?.spouse_birth_date ?? null,
    bank_number: user?.payment_details?.bank_number ?? "",
    bank_branch: user?.payment_details?.bank_branch ?? "",
    bank_account_number: user?.payment_details?.bank_account_number ?? "",
  });

  const [notifyData, setNotifyData] = useState<NotificationFormData>({
    notify_account: user?.notify_account ?? true,
    notify_receipts: user?.notify_receipts ?? true,
    notify_general: user?.notify_general ?? true,
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email_address: user.email_address ?? "",
      id_number: user.id_number ?? "",
      birth_date: user.birth_date ?? null,
      phone_number: user.phone_number ?? "",
      spouse_first_name: user.spouse_first_name ?? "",
      spouse_last_name: user.spouse_last_name ?? "",
      spouse_id_number: user.spouse_id_number ?? "",
      spouse_birth_date: user.spouse_birth_date ?? null,
      bank_number: user.payment_details?.bank_number ?? "",
      bank_branch: user.payment_details?.bank_branch ?? "",
      bank_account_number: user.payment_details?.bank_account_number ?? "",
    });

    setNotifyData({
      notify_account: user.notify_account ?? true,
      notify_receipts: user.notify_receipts ?? true,
      notify_general: user.notify_general ?? true,
    });
  }, [user]);

  const joinDate = formatDate(parseDate(user?.join_date));
  const birthDate = formatDate(parseDate(user?.birth_date));
  const spouseBirthDate = formatDate(parseDate(user?.spouse_birth_date));
  const membershipTypeText = mapMembershipType(user?.membership_type);
  const fullDisplayName = useMemo(() => buildFullDisplayName(user), [user]);

  const bankInfo = useMemo(
    () => ({
      bank_number: user?.payment_details?.bank_number ?? "לא הוזן",
      bank_branch: user?.payment_details?.bank_branch ?? "לא הוזן",
      bank_account_number: user?.payment_details?.bank_account_number ?? "לא הוזן",
    }),
    [user?.payment_details]
  );

  const surface = isDark ? "rgba(15,23,42,0.84)" : "rgba(255,255,255,0.88)";
  const softBorder = isDark
    ? "1px solid rgba(148,163,184,0.22)"
    : "1px solid rgba(15,23,42,0.08)";

  const cardSx = {
    p: 3,
    borderRadius: 4,
    background: surface,
    border: softBorder,
    backdropFilter: "blur(8px)",
    boxShadow: isDark
      ? "0 12px 30px rgba(2,6,23,0.35)"
      : "0 12px 30px rgba(15,23,42,0.08)",
    height: "100%",
  } as const;

  const toNullableDate = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      const updated = await toast.promise(
        dispatch(
          editUser({
            userId: user.id,
            userData: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              email_address: formData.email_address,
              id_number: formData.id_number,
              birth_date: toNullableDate(formData.birth_date),
              phone_number: formData.phone_number,
              spouse_first_name: formData.spouse_first_name,
              spouse_last_name: formData.spouse_last_name,
              spouse_id_number: formData.spouse_id_number,
              spouse_birth_date: toNullableDate(formData.spouse_birth_date),
              payment_details: {
                bank_number: Number(formData.bank_number) || 0,
                bank_branch: Number(formData.bank_branch) || 0,
                bank_account_number: Number(formData.bank_account_number) || 0,
              } as any,
            },
          })
        ).unwrap(),
        {
          pending: "שומר פרטים...",
          success: "הפרטים עודכנו בהצלחה",
          error: "עדכון הפרטים נכשל",
        }
      );
      dispatch(setAuthUserData(updated));
      setEditOpen(false);
    } catch {
      // handled by toast
    }
  };

  const handleNotifySave = async () => {
    if (!user?.id) return;
    try {
      const updated = await toast.promise(
        dispatch(
          editUser({
            userId: user.id,
            userData: {
              notify_account: notifyData.notify_account,
              notify_receipts: notifyData.notify_receipts,
              notify_general: notifyData.notify_general,
            },
          })
        ).unwrap(),
        {
          pending: "שומר התראות...",
          success: "ההתראות עודכנו בהצלחה",
          error: "עדכון ההתראות נכשל",
        }
      );
      dispatch(setAuthUserData(updated));
      setNotifyOpen(false);
    } catch {
      // handled by toast
    }
  };

  const handleSendYearSummary = async () => {
    try {
      await toast.promise(api.post("/users/year-summary"), {
        pending: "שולח סיכום שנה אחרונה...",
        success: "הסיכום נשלח למייל שלך",
        error: "שליחת הסיכום נכשלה",
      });
    } catch {
      // handled by toast
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        px: { xs: 2, sm: 4, md: 6 },
        direction: "rtl",
        fontFamily: '"Assistant", "Heebo", Arial, sans-serif',
        background: isDark
          ? "radial-gradient(circle at 12% 8%, rgba(56,189,248,0.16), transparent 35%), radial-gradient(circle at 88% 5%, rgba(34,197,94,0.14), transparent 32%), linear-gradient(180deg, #0b1120 0%, #0f172a 72%)"
          : "radial-gradient(circle at 12% 8%, rgba(56,189,248,0.13), transparent 35%), radial-gradient(circle at 88% 5%, rgba(34,197,94,0.1), transparent 32%), linear-gradient(180deg, #f8fafc 0%, #ffffff 72%)",
      }}
    >
      <ProfileHeaderCard
        isDark={isDark}
        softBorder={softBorder}
        fullDisplayName={fullDisplayName}
        onSendYearSummary={handleSendYearSummary}
        onOpenEdit={() => setEditOpen(true)}
      />

      {isSm ? (
        <Box sx={{ mt: 1.5 }}>
          <Tabs
            value={mobileTab}
            onChange={(_, value) => setMobileTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            <Tab label="משתמש" />
            <Tab label="בנק" />
            <Tab label="בן/בת זוג" />
            <Tab label="התראות" />
          </Tabs>

          {mobileTab === 0 && (
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<BadgeRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי משתמש"
              rows={[
                { label: "מספר זהות", value: user?.id_number ?? "לא הוזן" },
                { label: "תאריך לידה", value: birthDate || "לא הוזן" },
                { label: "טלפון", value: user?.phone_number ?? "לא הוזן" },
                { label: "אימייל", value: user?.email_address ?? "לא הוזן" },
                { label: "תאריך הצטרפות", value: joinDate || "לא הוזן" },
                { label: "סוג חברות", value: membershipTypeText },
              ]}
            />
          )}

          {mobileTab === 1 && (
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<AccountBalanceRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי בנק"
              rows={[
                { label: "מספר בנק", value: bankInfo.bank_number },
                { label: "מספר סניף", value: bankInfo.bank_branch },
                { label: "מספר חשבון", value: bankInfo.bank_account_number },
              ]}
            />
          )}

          {mobileTab === 2 && (
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<FavoriteRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי בן/בת זוג"
              rows={[
                { label: "שם פרטי", value: user?.spouse_first_name || "לא הוזן" },
                { label: "שם משפחה", value: user?.spouse_last_name || "לא הוזן" },
                { label: "תעודת זהות", value: user?.spouse_id_number || "לא הוזן" },
                { label: "תאריך לידה", value: spouseBirthDate || "לא הוזן" },
              ]}
            />
          )}

          {mobileTab === 3 && (
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<NotificationsActiveRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי התראות"
              rows={[
                { label: "התראות חשבון", value: notifyData.notify_account ? "פעיל" : "כבוי" },
                { label: "קבלות/אישורים", value: notifyData.notify_receipts ? "פעיל" : "כבוי" },
                { label: "עדכונים כלליים", value: notifyData.notify_general ? "פעיל" : "כבוי" },
              ]}
              action={
                <Button
                  variant="outlined"
                  onClick={() => setNotifyOpen(true)}
                  sx={{ borderRadius: 3, fontWeight: 800 }}
                >
                  עריכת התראות
                </Button>
              }
            />
          )}
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
          <Grid item xs={12} md={6}>
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<BadgeRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי משתמש"
              rows={[
                { label: "מספר זהות", value: user?.id_number ?? "לא הוזן" },
                { label: "תאריך לידה", value: birthDate || "לא הוזן" },
                { label: "טלפון", value: user?.phone_number ?? "לא הוזן" },
                { label: "אימייל", value: user?.email_address ?? "לא הוזן" },
                { label: "תאריך הצטרפות", value: joinDate || "לא הוזן" },
                { label: "סוג חברות", value: membershipTypeText },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<AccountBalanceRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי בנק"
              rows={[
                { label: "מספר בנק", value: bankInfo.bank_number },
                { label: "מספר סניף", value: bankInfo.bank_branch },
                { label: "מספר חשבון", value: bankInfo.bank_account_number },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<FavoriteRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי בן/בת זוג"
              rows={[
                { label: "שם פרטי", value: user?.spouse_first_name || "לא הוזן" },
                { label: "שם משפחה", value: user?.spouse_last_name || "לא הוזן" },
                { label: "תעודת זהות", value: user?.spouse_id_number || "לא הוזן" },
                { label: "תאריך לידה", value: spouseBirthDate || "לא הוזן" },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ProfileInfoCard
              cardSx={cardSx}
              icon={<NotificationsActiveRoundedIcon sx={{ color: "#22c55e" }} />}
              title="פרטי התראות"
              rows={[
                { label: "התראות חשבון", value: notifyData.notify_account ? "פעיל" : "כבוי" },
                { label: "קבלות/אישורים", value: notifyData.notify_receipts ? "פעיל" : "כבוי" },
                { label: "עדכונים כלליים", value: notifyData.notify_general ? "פעיל" : "כבוי" },
              ]}
              action={
                <Button
                  variant="outlined"
                  onClick={() => setNotifyOpen(true)}
                  sx={{ borderRadius: 3, fontWeight: 800 }}
                >
                  עריכת התראות
                </Button>
              }
            />
          </Grid>
        </Grid>
      )}

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
      />

      <EditNotificationsDialog
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        onSave={handleNotifySave}
        notifyData={notifyData}
        setNotifyData={setNotifyData}
      />
    </Box>
  );
};

export default UserProfilePage;
