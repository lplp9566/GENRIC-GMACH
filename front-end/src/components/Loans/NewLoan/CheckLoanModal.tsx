// src/components/Loans/CheckLoanModal.tsx
import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { ICreateLoan } from "../LoanDto";
import { AppDispatch, RootState } from "../../../store/store";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  checkLoan,
  createLoan,
} from "../../../store/features/admin/adminLoanSlice";
import { toast } from "react-toastify";

interface Props {
  loan: ICreateLoan;
  onClose: () => void;
}

const CheckLoanModal: React.FC<Props> = ({ onClose, loan }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // שולפים מה־Redux את הסטטוס והתשובה של בדיקת ההלוואה
  const { checkLoanStatus, checkLoanResponse } = useSelector(
    (state: RootState) => state.adminLoansSlice
  );

  useEffect(() => {
    // ברגע שהמודל נפתח, שולחים את הקריאה לבדיקה
    dispatch(checkLoan(loan));

    // נקודה לניקוי state במידה וסוגרים את המודל
    return () => {
      // אם תרצה לאפס את הבדיקה
      // dispatch(clearCheckLoan());
    };
  }, [dispatch, loan]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: (theme) => theme.palette.background.paper,
        p: 4,
        borderRadius: 2,
        boxShadow: 24,
        zIndex: 1300,
        width: { xs: "90%", sm: 400 },
      }}
    >
      <Typography variant="h6" gutterBottom>
        בדיקת הלוואה
      </Typography>

      {checkLoanStatus === "pending" && (
        <Typography sx={{ mb: 2 }}>בודק את פרטי ההלוואה שלך…</Typography>
      )}

      {checkLoanStatus === "fulfilled" && checkLoanResponse.ok && (
        <Typography sx={{ mb: 2, color: "green" }}>
          ההלוואה תקינה וניתן ליצור אותה!
        </Typography>
      )}

      {checkLoanStatus === "fulfilled" && !checkLoanResponse.ok && (
        <Typography sx={{ mb: 2, color: "red" }}>
          לא ניתן ליצור את ההלוואה: {checkLoanResponse.error}
        </Typography>
      )}

      {checkLoanStatus === "rejected" && (
        <Typography sx={{ mb: 2, color: "red" }}>
          קרתה שגיאה בבדיקת ההלוואה.
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={onClose} disabled={checkLoanStatus === "pending"}>
          ביטול
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (checkLoanResponse.ok) {
              dispatch(createLoan(loan));
              navigate("/loans");
              toast.success("ההלוואה נוצרה בהצלחה!");
            } else {
              // toast.error("ההלוואה לא תקינה, לא מומלץ להמשיך.");
              dispatch(createLoan(loan));
              navigate("/loans");
              toast.success("ההלוואה נוצרה בהצלחה!");
            }
          }}
          sx={{ ml: 1 }}
          disabled={checkLoanStatus === "pending"}
        >
          {checkLoanResponse.ok
            ? "אשר הלוואה "
            : "אשר הלוואה בכל זאת (לא מומלץ)"}
        </Button>
      </Box>
    </Box>
  );
};

export default CheckLoanModal;
