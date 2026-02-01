import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

type PreferredView = "admin" | "user";

const ChooseViewModal: React.FC<{
  open: boolean;
  onSelect: (view: PreferredView) => void;
}> = ({ open, onSelect }) => {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth dir="rtl">
      <DialogTitle>בחירת תצוגה</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          יש לך הרשאות מנהל, אבל החשבון אינו אדמין מלא. באיזו תצוגה תרצה להיכנס?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "space-between" }}>
          <Button variant="outlined" onClick={() => onSelect("user")}>
            תצוגת משתמש
          </Button>
          <Button variant="contained" onClick={() => onSelect("admin")}>
            תצוגת מנהל
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export function AdminOnlyRoute() {
  const { user } = useSelector((s: RootState) => s.authslice);
  const [choice, setChoice] = useState<PreferredView | null>(null);
  if (!user) return null;

  const permission = user.user?.permission;
  const hasAdminPermission = permission === "admin_read" || permission === "admin_write";
  const needsChoice = !user.is_admin && hasAdminPermission;

  if (needsChoice && !choice) {
    return <ChooseViewModal open onSelect={(v) => setChoice(v)} />;
  }

  const allowAdmin = user.is_admin || (needsChoice && choice === "admin");
  return allowAdmin ? <Outlet /> : <Navigate to="/u" replace />;
}

export function UserOnlyRoute() {
  const { user } = useSelector((s: RootState) => s.authslice);
  if (!user) return null;
  const [choice, setChoice] = useState<PreferredView | null>(null);

  const permission = user.user?.permission;
  const hasAdminPermission = permission === "admin_read" || permission === "admin_write";
  const needsChoice = !user.is_admin && hasAdminPermission;

  if (needsChoice && !choice) {
    return <ChooseViewModal open onSelect={(v) => setChoice(v)} />;
  }

  if (user.is_admin) return <Navigate to="/home" replace />;

  const allowUser =
    permission === "user" || (needsChoice && choice === "user");

  return allowUser ? <Outlet /> : <Navigate to="/home" replace />;
}

export function AdminWriteRoute() {
  const { user } = useSelector((s: RootState) => s.authslice);
  if (!user) return null;
  const permission = user.permission ?? user.user?.permission;
  const canWrite = user.is_admin || permission === "admin_write";
  return canWrite ? <Outlet /> : <Navigate to="/users" replace />;
}
