import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Grid, Typography, Divider } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AppDispatch, RootState } from "../../../store/store";
import {
  getLoanDetails,
} from "../../../store/features/admin/adminLoanSlice";
import { GeneralInfoCard } from "./GeneralInfoCard";
import Actions from "../LaonActions/Actions";
import ActionsTable from "./ActionsTable";
import LoadingIndicator from "../../StatusComponents/LoadingIndicator";
import useLoanSubmit from "../../../Hooks/LoanHooks/LoanActionsHooks";

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loan = useSelector((s: RootState) =>
    s.adminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const LoanDetails = useSelector(
    (s: RootState) => s.adminLoansSlice.loanDetails
  );
  console.log(LoanDetails);

  // const handleSubmit = async (dto: ICreateLoanAction ) => {
  //   await dispatch(createLoanAction(dto)).unwrap();
  //   await dispatch(getLoanDetails(loanId));
  // };
  const handleSubmit = useLoanSubmit(loanId);
  useEffect(() => {
    if (loanId) dispatch(getLoanDetails(loanId));
  }, [dispatch ]);

  if (!loan || !LoanDetails)
    return (
    <LoadingIndicator/>
    );

  return (
    <Box
      sx={{
        padding: "24px 0 10px 5px",
        minHeight: "100vh",
        direction: "rtl",
        backgroundColor: "#F5F7FA",
      }}
    >
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        startIcon={<ArrowBackIcon sx={{ ml: 1 }} />}
        sx={{
          mb: 4,
          color: "#555",
          "&:hover": { backgroundColor: "rgba(0,0,0,.04)" },
        }}
      >
        חזור לדף הלוואות
      </Button>

      <Typography
        variant="h3"
        sx={{
          mb: 4,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        פרטי הלוואה עבור:{" "}
        <Box component="span" sx={{ color: "#007BFF" }}>
          {loan.user.first_name} {loan.user.last_name}
        </Box>
        /
        <Box component="span" sx={{ color: "#007BFF" }}>
          {loan.purpose}
        </Box>

      </Typography>

      <Divider sx={{ mb: 5 }} />

<Grid
  container
  spacing={4}
  // על מסכים קטנים – סדר בטור, על מסכים גדולים – שורה מימין לשמאל
  direction={{ xs: "column", md: "row-reverse" }}
  // על desktop תפרוס בין הפריטים, על mobile תתיישר לימין
  justifyContent={{ xs: "flex-start", md: "space-between" }}
  alignItems="flex-start"
  sx={{ width: "100%" }}
>
  {/* 1) פרטי הלוואה – יופיע ראשון במובייל, צד שמאל ב-desktop */}
  <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "40%" } }}>
    <GeneralInfoCard loan={LoanDetails} />
  </Grid>

  {/* 2) Actions – באמצע ב-desktop, מתחת ב-mobile */}
  {LoanDetails.isActive && (
    <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "20%" } }}>
      <Actions loanId={loanId} handleSubmit={handleSubmit} />
    </Grid>
  )}

  {/* 3) טבלת פעולות – יופיע אחרון במובייל, צד ימין ב-desktop */}
  <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "30%" } }}>
    <ActionsTable actions={LoanDetails.actions ?? []} />
  </Grid>
</Grid>
    </Box>
  );
};

export default LoanDetailsPage;
