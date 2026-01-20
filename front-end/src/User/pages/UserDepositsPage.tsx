import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getAllDeposits,
  getDepositActions,
  getDepositDetails,
} from "../../store/features/admin/adminDepositsSlice";
import { StatusGeneric } from "../../common/indexTypes";
import DepositCard from "../../Admin/components/Deposits/DepositsDashboard/DepositCard";
import DepositDetailsInfoCard from "../../Admin/components/Deposits/DepositsDetails/DepositDetailsInfoCard";
import DepositActionTable from "../../Admin/components/Deposits/DepositsDetails/DepositActionTable";
import LoadingIndicator from "../../Admin/components/StatusComponents/LoadingIndicator";

const UserDepositsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const userId = authUser?.user?.id;
  const { allDeposits, allDepositsStatus } = useSelector(
    (s: RootState) => s.AdminDepositsSlice
  );
  const deposit = useSelector(
    (s: RootState) => s.AdminDepositsSlice.currentDeposit
  );
  const actions = useSelector(
    (s: RootState) => s.AdminDepositsSlice.depositActions
  );

  const [selectedDepositId, setSelectedDepositId] = useState<number | null>(
    null
  );
  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const [autoFallback, setAutoFallback] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(
        getAllDeposits({
          page: 1,
          limit: 100,
          status: filter,
          userId,
        })
      );
    }
  }, [dispatch, userId, filter]);

  useEffect(() => {
    if (
      filter === StatusGeneric.ACTIVE &&
      allDepositsStatus === "fulfilled" &&
      allDeposits.length === 0 &&
      !autoFallback
    ) {
      setAutoFallback(true);
      setFilter(StatusGeneric.ALL);
    }
  }, [filter, allDepositsStatus, allDeposits.length, autoFallback]);

  useEffect(() => {
    if (allDeposits.length === 0) {
      setSelectedDepositId(null);
      return;
    }
    if (
      !selectedDepositId ||
      !allDeposits.some((d) => d.id === selectedDepositId)
    ) {
      setSelectedDepositId(allDeposits[0].id);
    }
  }, [allDeposits, selectedDepositId]);

  useEffect(() => {
    if (selectedDepositId) {
      dispatch(getDepositDetails(selectedDepositId));
      dispatch(getDepositActions(selectedDepositId));
    }
  }, [dispatch, selectedDepositId]);

  if (allDepositsStatus === "pending" && allDeposits.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 4, direction: "rtl" }}>
            <Container maxWidth="xl">
        <Grid container spacing={3} direction="row" sx={{ direction: "ltr" }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                הפקדות
              </Typography>
              <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                <InputLabel id="user-deposits-filter-label">סינון</InputLabel>
                <Select
                  labelId="user-deposits-filter-label"
                  label="סינון"
                  value={filter}
                  onChange={(e) => {
                    setAutoFallback(false);
                    setFilter(e.target.value as StatusGeneric);
                  }}
                >
                  <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                  <MenuItem value={StatusGeneric.ACTIVE}>פעילות</MenuItem>
                  <MenuItem value={StatusGeneric.INACTIVE}>לא פעילות</MenuItem>
                </Select>
              </FormControl>
              <Box>
                {allDeposits.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    אין הפקדות על שמך
                  </Typography>
                ) : (
                  allDeposits.map((depositItem) => {
                    const isSelected = depositItem.id === selectedDepositId;
                    return (
                      <Box
                        key={depositItem.id}
                        sx={{
                          mb: 2,
                          border: isSelected
                            ? "2px solid #2a8c82"
                            : "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <DepositCard
                          deposit={depositItem}
                          readOnly
                          onClick={() => setSelectedDepositId(depositItem.id)}
                        />
                      </Box>
                    );
                  })
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              {deposit ? (
                <DepositDetailsInfoCard deposit={deposit} />
              ) : (
                <Typography variant="body1">בחר הפקדה להצגת פרטים.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, direction: "rtl" }}>
              {selectedDepositId ? (
                <DepositActionTable actions={actions ?? []} />
              ) : (
                <Typography variant="body1">בחר הפקדה להצגת הפעולות.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDepositsPage;
