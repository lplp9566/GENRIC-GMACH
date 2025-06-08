import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AppDispatch, RootState } from "../../../store/store";
import { getAllLoanActions } from "../../../store/features/admin/adminLoanSlice";

/* קומפוננטות־בן */
import { GeneralInfoCard } from "./GeneralInfoCard";
import { ActionsTable }   from "./ActionsTable";
import Actions            from "../LaonActions/Actions";

const LoanDetailsPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const loanId   = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loan = useSelector((s: RootState) =>
    s.adminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const actions = useSelector((s: RootState) =>
    s.adminLoansSlice.loanActions?.filter((a) => a.loan.id === loanId) || []
  );

  /* טעינת פעולות */
  useEffect(() => {
    if (loanId) dispatch(getAllLoanActions());
  }, [dispatch, loanId]);

  /* מצב-טעינה */
  if (!loan)
    return (
      <Box
        sx={{
          p: 4,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          טוען פרטי הלוואה…
        </Typography>
      </Box>
    );

  /* ---------------------- דף ---------------------- */
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        direction: "rtl",
        backgroundColor: "#F5F7FA",
      }}
    >
      {/* חזרה לרשימת־הלוואות */}
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon sx={{ ml: 1 }} />}
        sx={{ mb: 4, color: "#555", "&:hover": { backgroundColor: "rgba(0,0,0,.04)" } }}
      >
        חזור לדף הלוואות
      </Button>

      {/* כותרת */}
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 700, display: "flex", justifyContent: "center" }}>
        פרטי הלוואה עבור:{" "}
        <Box component="span" sx={{ color: "#007BFF" }}>
          {loan.user.first_name} {loan.user.last_name}
        </Box>
      </Typography>
      <Divider sx={{ mb: 5 }} />

      {/* ----------  פריסה: טבלה | פעולות | פרטי-הלוואה ---------- */}
      <Grid container spacing={2}>
        {/* ימינה – טבלת פעולות */}
        <Grid item xs={12} md={6}>
          <ActionsTable actions={actions} />
        </Grid>

        {/* אמצע – כפתורי פעולה */}
        <Grid item xs={12} md={2}>
          <Actions loanId={loanId}/>
        </Grid>

        {/* שמאלה – כרטיס מידע */}
        <Grid item xs={12} md={4}>
          <GeneralInfoCard loan={loan} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoanDetailsPage;
