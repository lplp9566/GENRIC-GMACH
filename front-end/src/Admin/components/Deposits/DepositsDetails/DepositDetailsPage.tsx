import { Box, Button, Divider, Grid } from "@mui/material";
import  { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../../../store/store";
import DepositActionTable from "./DepositActionTable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getDepositActions } from "../../../../store/features/admin/adminDepositsSlice";
import DepositsActions from "../DepositsAction/DepositsActions";
import DepositDetailsInfoCard from "./DepositDetailsInfoCard";

const DepositDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
    const depositId = Number(id);
    const deposit = useSelector((s: RootState) =>
      s.AdminDepositsSlice.allDeposits?.find((d) => d.id === depositId)
    );
    const depositDetails = useSelector(
      (s: RootState) => s.AdminDepositsSlice.depositActions
    );
    useEffect(() => {
      if (depositId) dispatch(getDepositActions(depositId));
    }, [dispatch, depositId]);
    console.log(depositId);
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
        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "40%" } }}>
          <DepositDetailsInfoCard deposit={deposit!} />
        </Grid>

          <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "20%" } }}>
            <DepositsActions
          depositId={depositId}
          max={deposit?.current_balance ?? 0}
            />
          </Grid>
        

        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "30%" } }}>
          <DepositActionTable actions={depositDetails ?? []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepositDetailsPage;
