// src/pages/LoanDetailsPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AppDispatch, RootState } from "../../../../store/store";
import { getLoanDetails } from "../../../../store/features/admin/adminLoanSlice";
import ActionsTable from "../LoanDetails/ActionsTable";
import LoadingIndicator from "../../StatusComponents/LoadingIndicator";
import useLoanSubmit from "../../../Hooks/LoanHooks/LoanActionsHooks";
import { GeneralLoanInfoCard } from "./GeneralLoanInfoCard";
import Actions from "../LoanActions/Actions";
import LoanHeader from "./LoanHeader";

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loan = useSelector((s: RootState) =>
    s.adminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const loanDetails = useSelector(
    (s: RootState) => s.adminLoansSlice.loanDetails
  );
  const handleSubmit = useLoanSubmit(loanId);

  useEffect(() => {
    if (loanId) dispatch(getLoanDetails(loanId));
  }, [dispatch, loanId]);

  if (!loan || !loanDetails) return <LoadingIndicator />;

  // חישוב אחוז החזר ויתרת הלוואה
  const principal = loan.loan_amount;
  const remaining = loanDetails.remaining_balance;
  // const repaid = principal - remaining;
  const balance = loanDetails.balance;
  // const percentRepaid =
  //   principal > 0 ? Math.min((repaid / principal) * 100, 100) : 0;

  return (
    <Box
      sx={{
        pt: 2,
        px: { xs: 2, md: 4 },
        pb: 5,
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
          mb: 2,
          color: "#555",
          bgcolor: "#F5F7FA",
          "&:hover": { backgroundColor: "rgba(0,0,0,.04)" },
        }}
      >
        חזור לדף הלוואות
      </Button>
      <LoanHeader
        firstName={loan.user.first_name}
        lastName={loan.user.last_name}
        principal={principal}
        remaining={remaining}
        balance={balance}
        purpose={loan.purpose}
      />
      <Divider />
      <Grid
        container
        spacing={4}
        direction={{ xs: "column", md: "row-reverse" }}
        justifyContent={{ xs: "flex-start", md: "space-between" }}
        alignItems="flex-start"
        sx={{ mt: 3 }}
      >
        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "40%" } }}>
          <GeneralLoanInfoCard loan={loanDetails} />
        </Grid>

        {loanDetails.isActive && (
          <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "20%" } }}>
            <Actions
              loanId={loanId}
              handleSubmit={handleSubmit}
              max={loanDetails.remaining_balance}
            />
          </Grid>
        )}

        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "30%" } }}>
          <ActionsTable actions={loanDetails.actions ?? []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoanDetailsPage;
