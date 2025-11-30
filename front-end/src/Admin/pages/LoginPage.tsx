import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../store/store";
import { login, selectAuth, validate } from "../../store/features/auth/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
const auth = useSelector(selectAuth);
  const status = auth?.status ?? "idle";
const error = auth?.error ?? null;
  const navigate = useNavigate();
  // const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const from = location.state?.from?.pathname ?? "/";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(login({ email, password })).unwrap(); // מציב cookie
    await dispatch(validate()).unwrap();                 // מביא user
    navigate("/Home", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center">ברוכים הבאים לגמח אהבת חסד </Typography>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>התחברות</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
            <TextField label="אימייל" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="סיסמה" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <Typography color="error" variant="body2">{String(error)}</Typography>}
            <Button type="submit" variant="contained" disabled={!email || !password || status === "pending"}>
              {status === "pending" ? "מתחבר…" : "התחברות"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
