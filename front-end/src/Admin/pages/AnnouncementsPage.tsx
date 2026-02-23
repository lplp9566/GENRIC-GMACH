import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { api } from "../../store/axiosInstance";
import SelectAllUsers from "../components/SelectUsers/SelectAllUsers";

type Audience = "members" | "friends" | "all" | "custom";

type MyAnnouncement = {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  readAt: string | null;
  seen: boolean;
};

type MyAnnouncementsResponse = {
  unreadCount: number;
  items: MyAnnouncement[];
};

type AdminAnnouncement = {
  id: string;
  title: string | null;
  body: string;
  audience?: Audience | null;
  createdAt: string;
  totalRecipients: number;
  totalSeen: number;
  totalUnseen: number;
};

type RecipientItem = {
  userId: number;
  name: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  seen: boolean;
};

type RecipientStatusResponse = {
  announcementId: string;
  summary: {
    totalRecipients: number;
    totalSeen: number;
    totalUnseen: number;
  };
  items: RecipientItem[];
};

const fmt = (v?: string | null) => (v ? new Date(v).toLocaleString("he-IL") : "-");
const fmtTimeOnly = (v?: string | null) =>
  v ? new Date(v).toLocaleString("he-IL", { hour: "2-digit", minute: "2-digit" }) : "-";

const audienceLabel = (audience?: Audience | null) => {
  switch (audience) {
    case "all":
      return "כולם";
    case "members":
      return "חברים";
    case "friends":
      return "ידידים";
    case "custom":
      return "משתמשים ספציפיים";
    default:
      return "לא ידוע";
  }
};

export default function AnnouncementsPage() {
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const canManage = Boolean(authUser?.is_admin) || authUser?.permission === "admin_write";

  const [myData, setMyData] = useState<MyAnnouncementsResponse>({ unreadCount: 0, items: [] });
  const [adminItems, setAdminItems] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([0]);
  const [submitting, setSubmitting] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [recipientsData, setRecipientsData] = useState<RecipientStatusResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<AdminAnnouncement | null>(null);

  const unreadCount = useMemo(() => myData.unreadCount ?? 0, [myData.unreadCount]);

  const loadMy = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<MyAnnouncementsResponse>("/announcements/my");
      setMyData(data);
      const unseenIds = (data.items ?? []).filter((m) => !m.seen).map((m) => m.id);
      if (unseenIds.length > 0) {
        const nowIso = new Date().toISOString();
        setMyData((prev) => ({
          unreadCount: 0,
          items: prev.items.map((m) =>
            unseenIds.includes(m.id) && !m.readAt ? { ...m, seen: true, readAt: nowIso } : m,
          ),
        }));
        await Promise.allSettled(
          unseenIds.map((id) => api.post(`/announcements/${id}/read`)),
        );
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  };

  const loadAdmin = async () => {
    if (!canManage) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get<AdminAnnouncement[]>("/announcements", { params });
      setAdminItems(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה בטעינת הודעות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) {
      loadAdmin();
    } else {
      loadMy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const onCreate = async () => {
    if (!title.trim()) {
      setError("כותרת היא שדה חובה");
      return;
    }
    if (!body.trim()) {
      setError("תוכן ההודעה הוא שדה חובה");
      return;
    }

    const payload: {
      title: string;
      body: string;
      audience: Audience;
      userIds?: number[];
    } = {
      title: title.trim(),
      body: body.trim(),
      audience,
    };

    if (audience === "custom") {
      const ids = Array.from(new Set(selectedUsers.filter((n) => Number.isInteger(n) && n > 0)));
      if (!ids.length) {
        setError("יש לבחור לפחות משתמש אחד");
        return;
      }
      payload.userIds = ids;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post("/announcements", payload);
      setCreateOpen(false);
      setTitle("");
      setBody("");
      setAudience("all");
      setSelectedUsers([0]);
      await loadAdmin();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה ביצירת הודעה");
    } finally {
      setSubmitting(false);
    }
  };

  const openRecipients = async (announcementId: string) => {
    try {
      const { data } = await api.get<RecipientStatusResponse>(`/announcements/${announcementId}/recipients`);
      setRecipientsData(data);
      setRecipientsOpen(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה בטעינת סטטוס");
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await api.delete(`/announcements/${announcementId}`);
      setAdminItems((prev) => prev.filter((a) => a.id !== announcementId));
      if (recipientsData?.announcementId === announcementId) {
        setRecipientsOpen(false);
        setRecipientsData(null);
      }
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "שגיאה במחיקת הודעה");
    }
  };

  const openDeleteDialog = (announcement: AdminAnnouncement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialogOpen(true);
  };

  const setUserAt = (idx: number, userId: number) => {
    setSelectedUsers((prev) => prev.map((v, i) => (i === idx ? userId : v)));
  };

  const addUserSelect = () => setSelectedUsers((prev) => [...prev, 0]);
  const removeUserSelect = (idx: number) => {
    setSelectedUsers((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2, direction: "rtl" }}>
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            הודעות מערכת
          </Typography>
          {!canManage && (
            <Chip
              color={unreadCount > 0 ? "error" : "success"}
              label={unreadCount > 0 ? `${unreadCount} לא נקראו` : "הכל נקרא"}
            />
          )}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {canManage ? (
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={() => setCreateOpen(true)}>
                  יצירת הודעה חדשה
                </Button>
                <Button variant="outlined" onClick={() => setFilterOpen(true)}>
                  סינון תאריכים
                </Button>
              </Stack>

              {loading && <Typography>טוען...</Typography>}
              {!loading && adminItems.length === 0 && <Typography color="text.secondary">אין הודעות</Typography>}

              <Stack spacing={1.25} sx={{ maxHeight: "60vh", overflowY: "auto", pr: 0.5 }}>
                {adminItems.map((a) => (
                  <Box key={a.id} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 1.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={700}>{a.title || "ללא כותרת"}</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                          {a.body}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
                          <Typography variant="caption" color="text.secondary">
                            {fmtTimeOnly(a.createdAt)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => openRecipients(a.id)}
                            sx={{ p: 0.25 }}
                            title="סטטוס קריאה"
                          >
                            <DoneAllIcon
                              fontSize="small"
                              sx={{ color: a.totalUnseen > 0 ? "text.disabled" : "info.main" }}
                            />
                          </IconButton>
                        </Stack>
                      </Box>
                      <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.75}>
                        <Typography variant="body2" color="text.secondary">
                          נשלח אל: {audienceLabel(a.audience)}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => openDeleteDialog(a)}
                        >
                          מחיקה
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              {loading && <Typography>טוען...</Typography>}
              {!loading && myData.items.length === 0 && <Typography color="text.secondary">אין הודעות</Typography>}
              <Stack spacing={1.25} sx={{ maxHeight: "60vh", overflowY: "auto", pr: 0.5 }}>
                {myData.items.map((m) => (
                  <Box key={m.id} sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 1.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={700}>{m.title || "ללא כותרת"}</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                          {m.body}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
                          <Typography variant="caption" color="text.secondary">
                            {fmtTimeOnly(m.createdAt)}
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{ p: 0.25 }}
                            title={m.seen ? "נקרא" : "לא נקרא"}
                          >
                            <DoneAllIcon
                              fontSize="small"
                              sx={{ color: m.seen ? "info.main" : "text.disabled" }}
                            />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>יצירת הודעה חדשה</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="כותרת"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="תוכן"
              multiline
              minRows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <TextField
              select
              fullWidth
              label="קהל יעד"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
            >
              <MenuItem value="all">כולם</MenuItem>
              <MenuItem value="members">חברים</MenuItem>
              <MenuItem value="friends">ידידים</MenuItem>
              <MenuItem value="custom">משתמשים ספציפיים</MenuItem>
            </TextField>

            {audience === "custom" && (
              <Stack spacing={1}>
                {selectedUsers.map((userId, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <Box flex={1}>
                      <SelectAllUsers
                        filter="all"
                        value={userId > 0 ? userId : undefined}
                        onChange={(id) => setUserAt(idx, id)}
                        label={`בחר משתמש ${idx + 1}`}
                      />
                    </Box>
                    <IconButton onClick={() => removeUserSelect(idx)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Button variant="text" startIcon={<AddIcon />} onClick={addUserSelect}>
                  הוסף משתמש
                </Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>ביטול</Button>
          <Button variant="contained" onClick={onCreate} disabled={submitting}>
            שלח
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>סינון הודעות</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="date"
              label="מתאריך"
              InputLabelProps={{ shrink: true }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <TextField
              type="date"
              label="עד תאריך"
              InputLabelProps={{ shrink: true }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>סגירה</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setFilterOpen(false);
              await loadAdmin();
            }}
          >
            החל
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={recipientsOpen} onClose={() => setRecipientsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>סטטוס נמענים</DialogTitle>
        <DialogContent>
          {!recipientsData ? (
            <Typography>טוען...</Typography>
          ) : (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={`סה"כ: ${recipientsData.summary.totalRecipients}`} />
                <Chip color="success" label={`נקראו: ${recipientsData.summary.totalSeen}`} />
                <Chip color="warning" label={`לא נקראו: ${recipientsData.summary.totalUnseen}`} />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  נקראו
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  {recipientsData.items
                    .filter((r) => r.seen)
                    .map((r) => (
                      <ListItem key={`${r.userId}-seen`}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {(r.name?.[0] ?? String(r.userId)[0] ?? "?").toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={r.name || `משתמש ${r.userId}`}
                          secondary={`נקרא: ${fmt(r.readAt)}`}
                        />
                      </ListItem>
                    ))}
                  {recipientsData.items.filter((r) => r.seen).length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      אין נמענים שקראו עדיין.
                    </Typography>
                  )}
                </List>

                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  לא נקראו
                </Typography>
                <List dense>
                  {recipientsData.items
                    .filter((r) => !r.seen)
                    .map((r) => (
                      <ListItem key={`${r.userId}-unseen`}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: "grey.500" }}>
                            {(r.name?.[0] ?? String(r.userId)[0] ?? "?").toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={r.name || `משתמש ${r.userId}`}
                          secondary={`נשלח: ${fmt(r.deliveredAt)}`}
                        />
                      </ListItem>
                    ))}
                  {recipientsData.items.filter((r) => !r.seen).length === 0 && (
                    <Typography color="text.secondary" variant="body2">
                      כולם קראו.
                    </Typography>
                  )}
                </List>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAnnouncementToDelete(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>מחיקת הודעה</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            האם למחוק את ההודעה
            {announcementToDelete?.title ? ` "${announcementToDelete.title}"` : ""}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו לא ניתנת לשחזור.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setAnnouncementToDelete(null);
            }}
          >
            ביטול
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (announcementToDelete) {
                void deleteAnnouncement(announcementToDelete.id);
              }
            }}
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
