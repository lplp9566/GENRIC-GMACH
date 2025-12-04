import { Box, Button, Divider, Grid } from '@mui/material'
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import { useEffect } from 'react';
import { getTransactionsByInvestmentId } from '../../../../store/features/admin/adminInvestmentsSlice';
import LoadingIndicator from '../../StatusComponents/LoadingIndicator';

const InvestmentDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
  const investmentId = Number(id);
      const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const investment = useSelector((s:RootState)=> s.AdminInvestmentsSlice.allInvestments?.find((inv)=> inv.id === investmentId));
  const investmensDedails = useSelector((s:RootState)=> s.AdminInvestmentsSlice.investmentDetails)
  useEffect(() => {
    if (investmentId) dispatch(getTransactionsByInvestmentId(investmentId));

  }, [dispatch, investmentId]);
   if (!investment || !investmensDedails) return <LoadingIndicator />;
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
      {/* <LoanHeader
        firstName={loan.user.first_name}
        lastName={loan.user.last_name}
        principal={principal}
        remaining={remaining}
        balance={balance}
        purpose={loan.purpose}
      /> */}
      <Divider />
      <Grid
        container
        spacing={4}
        direction={{ xs: "column", md: "row-reverse" }}
        justifyContent={{ xs: "flex-start", md: "space-between" }}
        alignItems="flex-start"
        sx={{ mt: 3 }}
      >
        {/* <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "40%" } }}>
          <GeneralLoanInfoCard loan={loanDetails} />
        </Grid> */}

        {/* {loanDetails.isActive && (
          <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "20%" } }}>
            <Actions
              loanId={loanId}
              handleSubmit={handleSubmit}
              max={loanDetails.remaining_balance}
            />
          </Grid>
        )} */}

        {/* <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "30%" } }}>
          <ActionsTable actions={loanDetails.actions ?? []} />
        </Grid> */}
      </Grid>
    </Box>
  )
}

export default InvestmentDetailsPage