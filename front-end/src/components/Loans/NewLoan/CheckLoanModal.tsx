// src/components/Loans/CheckLoanModal.tsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ICreateLoan } from "../LoanDto";
import { AppDispatch, RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkLoan, createLoan } from "../../../store/features/admin/adminLoanSlice";
import { toast } from "react-toastify";
import { unwrapResult } from "@reduxjs/toolkit";

interface Props {
  loan: ICreateLoan;
  onClose: () => void;
}

const CheckLoanModal: React.FC<Props> = ({ onClose, loan }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    checkLoanStatus,
    checkLoanResponse,
    createLoanStatus,
    error: createError,
  } = useSelector((state: RootState) => state.adminLoansSlice);

  useEffect(() => {
    dispatch(checkLoan(loan));
    return () => {
    };
  }, [dispatch, loan]);

  const handleCreateLoan = async () => {
    const toastId = toast.info("יוצר הלוואה…", {
      autoClose: false,
      closeButton: false,
    });

    try {
      const actionResult = await dispatch(createLoan(loan));
      unwrapResult(actionResult);
      toast.dismiss(toastId);
      toast.success("ההלוואה נוצרה בהצלחה!");
      onClose();
      navigate("/loans");
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "שגיאה ביצירת ההלוואה");
    }
  };

  const isActionDisabled =
    checkLoanStatus === "pending" || createLoanStatus === "pending" || checkLoanStatus === "rejected";

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
          {checkLoanStatus === "pending" && (
            <CircularProgress size={24} color="primary" />
          )}

          {checkLoanStatus === "fulfilled" && checkLoanResponse.ok && (
            <Typography sx={{ color: "green", textAlign: "center" }}>
              ההלוואה תקינה וניתן ליצור אותה!
            </Typography>
          )}

          {checkLoanStatus === "fulfilled" && !checkLoanResponse.ok && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              לא ניתן ליצור הלוואה: {checkLoanResponse.error}
            </Typography>
          )}

          {checkLoanStatus === "rejected" && (
            <Typography sx={{ color: "red", textAlign: "center" }}>
              קרתה שגיאה בבדיקת ההלוואה.
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isActionDisabled}
            sx={{ color: theme.palette.text.secondary }}
          >
            ביטול
          </Button>
          <Button
            variant="contained"
            color={checkLoanResponse.ok ? "success" : "warning"}
            onClick={handleCreateLoan}
            disabled={isActionDisabled}
            sx={{
              minWidth: 140,
              boxShadow: theme.shadows[2],
            }}
          >
            {checkLoanResponse.ok
              ? "אשר הלוואה"
              : "אשר בכל זאת (לא מומלץ)"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CheckLoanModal;
