import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { formatDate } from "../../../../Admin/Hooks/genricFunction";

export type UserHomeAnnouncement = {
  id: string;
  title: string | null;
  body: string;
  createdAt: string;
  seen: boolean;
};

type Props = {
  items: UserHomeAnnouncement[];
  unreadCount: number;
  loading?: boolean;
  surface: string;
  softBorder: string;
  onOpenAll: () => void;
};

const UserAnnouncementsSection = ({
  items,
  unreadCount,
  loading = false,
  surface,
  softBorder,
  onOpenAll,
}: Props) => {
  const latest = items.slice(0, 3);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={900}>
          הודעות מערכת
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            color={unreadCount > 0 ? "error" : "success"}
            label={unreadCount > 0 ? `${unreadCount} לא נקראו` : "הכל נקרא"}
          />
          <Button variant="outlined" size="small" onClick={onOpenAll}>
            לכל ההודעות
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1.25}>
        {loading && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: surface, border: softBorder }}>
            <Typography color="text.secondary">טוען הודעות...</Typography>
          </Paper>
        )}

        {!loading && latest.length === 0 && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, background: surface, border: softBorder }}>
            <Typography color="text.secondary">אין הודעות מערכת כרגע.</Typography>
          </Paper>
        )}

        {!loading &&
          latest.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                background: surface,
                border: softBorder,
                borderRight: item.seen ? undefined : "4px solid #ef4444",
              }}
            >
              <Stack spacing={0.5}>
                <Typography fontWeight={800}>{item.title?.trim() || "ללא כותרת"}</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {item.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  נשלח: {formatDate(new Date(item.createdAt))}
                </Typography>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </>
  );
};

export default UserAnnouncementsSection;
