// src/components/Loans/CheckLoanModal.tsx
import React, { useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ICreateLoan, ICreateLoanAction } from "./LoanDto";
import { AppDispatch, RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  checkLoan,
  createLoan,
  setCheckLoanStatus,
  setLoanActionStatus,
} from "../../../store/features/admin/adminLoanSlice";
import { setLoanModalMode } from "../../../store/features/Main/AppMode";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import { toast } from "react-toastify";

interface Props {
  loan: ICreateLoan;
  onClose: () => void;
  type: "create" | "update";
  dto?: ICreateLoanAction;
  onSubmit: () => void;
}

const CheckLoanModal: React.FC<Props> = ({
  onClose,
  loan,
  type,
  onSubmit,
}) => {  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    checkLoanStatus,
    checkLoanResponse,
    createLoanStatus,
    createLoanActionStatus,
  } = useSelector((state: RootState) => state.AdminLoansSlice);

  const loanKey = useMemo(() => JSON.stringify(loan), [loan]);

  // ברגע שהקומפוננטה נטענת - מפעילים בדיקת הלוואה
  useEffect(() => {
    dispatch(checkLoan(loan));
  }, [dispatch, loanKey]);

  const handleCreateLoan = () => {
    if (type === "create") {
      // Promise של ה-API
      const promise = dispatch(createLoan(loan)).unwrap();

      // toast.promise מציג טוסט ברגע שהפэндינג, success או error
      toast.promise(
        promise,
        {
          pending: "יוצר הלוואה…",
          success: "ההלוואה נוצרה בהצלחה! 👌",
          error: "שגיאה ביצירת ההלוואה 💥",
        },
        { autoClose: 3000 }
      );

      promise
        .then(() => {
          dispatch(setCheckLoanStatus("idle"));
          onClose();
          navigate("/loans");
        })
        .catch(() => {
          dispatch(setCheckLoanStatus("idle"));
        });
    }

    if (type === "update" && onSubmit) {
      (async () => {
        try {
          await onSubmit();
        } catch {
          // errors are handled by the caller/toasts
        } finally {
          dispatch(setCheckLoanStatus("idle"));
          dispatch(setLoanActionStatus("idle"));
          dispatch(setLoanModalMode(false));
        }
      })();
    }
  };

  const isActionDisabled =
    checkLoanStatus === "pending" ||
    createLoanStatus === "pending" ||
    checkLoanStatus === "rejected";

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.5)",
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          width: { xs: "90%", sm: 400 },
          p: 3,
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" align="center" gutterBottom>
          בדיקת הלוואה
        </Typography>

        <Box
          sx={{
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {(checkLoanStatus === "pending" ||
            createLoanActionStatus === "pending") && (
            <LoadingIndicator />
          )}

          {checkLoanStatus === "fulfilled" &&
            checkLoanResponse.ok && (
              <Typography
                sx={{ color: "green", textAlign: "center" }}
              >
                ההלוואה תקינה וניתן ליצור אותה!
              </Typography>
            )}
          {checkLoanStatus === "fulfilled" &&
            !checkLoanResponse.ok && (
              <Typography
                sx={{ color: "red", textAlign: "center" }}
              >
                לא ניתן ליצור הלוואה: {checkLoanResponse.error}
              </Typography>
            )}
          {checkLoanStatus === "rejected" && (
            <Typography
              sx={{ color: "red", textAlign: "center" }}
            >
              קרתה שגיאה בבדיקת ההלוואה.
            </Typography>
          )}
        </Box>

        <Box
          dir="ltr"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Button onClick={onClose}>ביטול</Button>
          {checkLoanResponse.butten == true && (
                      <Button
            variant="contained"
            color={checkLoanResponse.ok ? "success" : "warning"}
            onClick={handleCreateLoan}
            disabled={isActionDisabled}
          >
            {checkLoanResponse.ok
              ? "אשר הלוואה"
              : "אשר בכל זאת"}
          </Button>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default CheckLoanModal;
