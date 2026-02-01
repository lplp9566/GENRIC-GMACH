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
import { ICreateLoanAction, ILoanAction } from "../LoanDto";

const LoanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const loan = useSelector((s: RootState) =>
    s.AdminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const loanDetails = useSelector(
    (s: RootState) => s.AdminLoansSlice.loanDetails
  );
  const handleSubmit = useLoanSubmit(loanId, () => {
    setActionsOpen(false);
    setInitialAction(null);
  });
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [initialAction, setInitialAction] =
    React.useState<ICreateLoanAction | null>(null);

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

  const handleOpenActions = (prefill?: ICreateLoanAction | null) => {
    setInitialAction(prefill ?? null);
    setActionsOpen(true);
  };

  const handleCopyAction = (action: ILoanAction) => {
    handleOpenActions({
      loanId,
      action_type: action.action_type,
      date: action.date,
      value: action.value,
    });
  };

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
        {canWrite && (
          <Button
            variant="contained"
            onClick={() => handleOpenActions(null)}
            disabled={!loanDetails.isActive}
            sx={{ bgcolor: "#2a8c82", "&:hover": { bgcolor: "#1f645f" } }}
          >
            פעולות להלוואה
          </Button>
        )}
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
          <ActionsTable
            actions={loanDetails.actions ?? []}
            loanId={loanId}
            readOnly={!canWrite}
            onCopyAction={handleCopyAction}
          />
        </Grid>
      </Grid>
      <Dialog
        open={actionsOpen}
        onClose={() => {
          setActionsOpen(false);
          setInitialAction(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Actions
            loanId={loanId}
            handleSubmit={handleSubmit}
            max={loanDetails.remaining_balance}
            initialAction={initialAction}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoanDetailsPage;
