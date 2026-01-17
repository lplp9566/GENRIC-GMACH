import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../store/axiosInstance";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const submitEmail = async () => {
    if (!email) return toast.error("נא להזין אימייל");
    if (!isValidEmail(email)) return toast.error("אימייל לא תקין");
    await toast.promise(api.post("/auth/forgot-password", { email }), {
      pending: "שולח קוד...",
      success: "קוד נשלח למייל",
      error: "שגיאה בשליחת הקוד",
    });
    setStep("code");
  };

  const submitCode = async () => {
    if (!code) return toast.error("נא להזין קוד");
    await toast.promise(api.post("/auth/verify-reset-code", { email, code }), {
      pending: "מאמת קוד...",
      success: "קוד אומת בהצלחה",
      error: "קוד שגוי או פג תוקף",
    });
    setStep("reset");
  };

  const submitReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      return toast.error("הסיסמה חייבת להיות לפחות 6 תווים");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("הסיסמאות לא תואמות");
    }
    await toast.promise(
      api.post("/auth/reset-password", { email, code, newPassword }),
      {
        pending: "מעדכן סיסמה...",
        success: "הסיסמה עודכנה בהצלחה",
        error: "שגיאה בעדכון הסיסמה",
      }
    );
    navigate("/", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={2}>
            שכחתי סיסמה
          </Typography>

          {step === "email" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                הזן כתובת מייל ונשלח אליך קוד אימות.
              </Typography>
              <TextField
                label="אימייל"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={submitEmail}>
                שלח קוד
              </Button>
            </Stack>
          )}

          {step === "code" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                הזן את הקוד שקיבלת במייל.
              </Typography>
              <TextField
                label="קוד אימות"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={submitCode}>
                אימות קוד
              </Button>
              <Button variant="text" onClick={() => setStep("email")}>חזור</Button>
            </Stack>
          )}

          {step === "reset" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                הזן סיסמה חדשה.
              </Typography>
              <TextField
                label="סיסמה חדשה"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
              <TextField
                label="אימות סיסמה"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={submitReset}>
                עדכון סיסמה
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
