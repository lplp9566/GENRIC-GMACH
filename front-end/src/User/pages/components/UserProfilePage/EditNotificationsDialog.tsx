import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { NotificationFormData } from "./types";

type Props = {
  open: boolean;
  notifyData: NotificationFormData;
  onClose: () => void;
  onSave: () => void;
  setNotifyData: React.Dispatch<React.SetStateAction<NotificationFormData>>;
};

const EditNotificationsDialog = ({
  open,
  notifyData,
  onClose,
  onSave,
  setNotifyData,
}: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ textAlign: "right" }}>עריכת התראות</DialogTitle>
    <DialogContent sx={{ direction: "rtl" }}>
      <Stack spacing={2} mt={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>התראות חשבון</Typography>
          <Switch
            checked={!!notifyData.notify_account}
            onChange={(e) =>
              setNotifyData((prev) => ({
                ...prev,
                notify_account: e.target.checked,
              }))
            }
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>קבלות/אישורים</Typography>
          <Switch
            checked={!!notifyData.notify_receipts}
            onChange={(e) =>
              setNotifyData((prev) => ({
                ...prev,
                notify_receipts: e.target.checked,
              }))
            }
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>עדכונים כלליים</Typography>
          <Switch
            checked={!!notifyData.notify_general}
            onChange={(e) =>
              setNotifyData((prev) => ({
                ...prev,
                notify_general: e.target.checked,
              }))
            }
          />
        </Stack>
      </Stack>
    </DialogContent>
    <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
      <Button onClick={onClose} variant="outlined">
        ביטול
      </Button>
      <Button onClick={onSave} variant="contained">
        שמירה
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditNotificationsDialog;

