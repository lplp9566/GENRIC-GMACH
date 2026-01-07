import { Box, Button, Divider, Grid } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AppDispatch, RootState } from "../../../../store/store";
import {
  createDepositAction,
  getDepositActions,
  getDepositDetails,
} from "../../../../store/features/admin/adminDepositsSlice";
import DepositActionTable from "./DepositActionTable";
import DepositsActions from "../DepositsAction/DepositsActions";
import DepositDetailsInfoCard from "./DepositDetailsInfoCard";
import { IDepositActionCreate } from "../depositsDto";

const DepositDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const depositId = Number(id);
  console.log(depositId, "DepositDetailsPage");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const actions = useSelector((s: RootState) => s.AdminDepositsSlice.depositActions);
  const deposit = useSelector((s: RootState) => s.AdminDepositsSlice.currentDeposit);

  // טעינה ראשונית
  useEffect(() => {
    if (!Number.isNaN(depositId)) {
      dispatch(getDepositActions(depositId));
      dispatch(getDepositDetails(depositId));
    }
  }, [dispatch, depositId]);

  // שליחת פעולה ורענון (ה-thunk כבר עושה refetch לשניהם)
  const handleSubmit = useCallback(
    async (dto: IDepositActionCreate) => {
      await dispatch(createDepositAction(dto)).unwrap();
    },
    [dispatch]
  );

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
        חזור לדף ההפקדות
      </Button>

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
          {deposit && <DepositDetailsInfoCard deposit={deposit} />}
        </Grid>
        {deposit?.isActive && (

        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "20%" } }}>
          <DepositsActions
            depositId={depositId}
            max={deposit?.current_balance ?? 0}
            handleSubmit={handleSubmit}
          />
        </Grid>
        )

        }

        <Grid item xs={12} md="auto" sx={{ flexBasis: { md: "30%" } }}>
          <DepositActionTable actions={actions ?? []} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DepositDetailsPage;
