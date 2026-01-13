// src/pages/LoanDetailsPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Grid, Divider, Dialog, DialogContent } from "@mui/material";
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
    s.AdminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );
  const handleSubmit = useLoanSubmit(loanId);
  const [actionsOpen, setActionsOpen] = React.useState(false);

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
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setActionsOpen(true)}
          disabled={!loanDetails.isActive}
          sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
        >
          ???? ?????
        </Button>
      </Box>
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

        <Grid item xs={12} md={4}>
          <ActionsTable actions={loanDetails.actions ?? []} loanId={loanId} />
        </Grid>
      </Grid>
      <Dialog
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Actions
            loanId={loanId}
            handleSubmit={handleSubmit}
            max={loanDetails.remaining_balance}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoanDetailsPage;
