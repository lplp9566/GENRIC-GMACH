import React, { FC } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import useTheme from "@mui/material/styles/useTheme";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { StatusGeneric } from "../../common/indexTypes";
import {
  getAllDeposits,
  setPage,
} from "../../store/features/admin/adminDepositsSlice";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import DepositsDashboard from "../components/Deposits/DepositsDashboard/DepositsDashboard";
import { setAddDepositModal } from "../../store/features/Main/AppMode";
import NewDepositModal from "../components/Deposits/newDeposit/newDeposit";

const DepositsPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = React.useState<StatusGeneric>(
    StatusGeneric.ACTIVE
  );
  const { allDeposits, page, pageCount, total } = useSelector(
    (s: RootState) => s.AdminDepositsSlice
  );
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const limit = 20;
  React.useEffect(() => {
    if (selectedUser?.id) {
      dispatch(
        getAllDeposits({ page, limit, status: filter, userId: selectedUser.id })
      );
    } else {
      dispatch(getAllDeposits({ page, limit, status: filter }));
    }
  }, [dispatch, page, filter, selectedUser]);
  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
    dispatch(setPage(1));
  };
  const depositModal = useSelector(
    (state: RootState) => state.mapModeSlice.AddDepositModal
  );
  return (
    <Box sx={{ bgcolor: "#F8F8F8", minHeight: "100vh", py: 4 }}>
      {depositModal && <NewDepositModal />}

      <Container maxWidth="lg">
        {/* HEADER */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            width: {
              xs: "100%",
              sm: "90%",
              md: "60%",
              lg: "40%",
            },
            mx: "auto",
            dir: "rtl",
          }}
        >
          <Stack spacing={2}>
            {/* כותרת ואייקון */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
              }}
            >
              <img
                width={48}
                height={48}
                src="https://img.icons8.com/office/40/safe-in.png"
                alt="loan"
              />
              <Typography variant="h5" fontWeight={600} textAlign="center">
                ניהול הפקדות
              </Typography>
            </Box>

            {/* כפתור + פילטר */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={() => dispatch(setAddDepositModal(true))}
                // onClick={() => navigate("/loans/new")}
                fullWidth={isSm}
                sx={{
                  bgcolor: "#2a8c82",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1f645f" },
                }}
              >
                הוסף הפקדה
              </Button>

              <FormControl
                size="small"
                fullWidth={isSm}
                sx={{
                  minWidth: { xs: "auto", sm: 160 },
                }}
              >
                <InputLabel
                  id="filter-status-label"
                  sx={{
                    color: "#424242",
                    fontWeight: 500,
                    "&.Mui-focused": { color: "#2a8c82" },
                  }}
                >
                  מצב הפקדות
                </InputLabel>
                <Select
                  labelId="filter-status-label"
                  value={filter}
                  label="מצב הפקדה"
                  onChange={handleFilterChange}
                  sx={{
                    borderRadius: 1,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#B0B0B0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2a8c82",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2a8c82",
                      borderWidth: 1.5,
                    },
                  }}
                >
                  <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                  <MenuItem value={StatusGeneric.ACTIVE}>פעילות</MenuItem>
                  <MenuItem value={StatusGeneric.INACTIVE}>לא פעילות</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Paper>

        {/* LOADING */}
        {status === "pending" && <LoadingIndicator />}

        {/* טבלה עם גלילה אופקית */}
        {status === "fulfilled" && (
          <Box
            component={Paper}
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              overflowX: "auto",
            }}
          ></Box>
        )}

        {/* PAGINATION */}
        {pageCount > 1 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, v) => dispatch(setPage(v))}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#424242",
                  "&.Mui-selected": {
                    bgcolor: "#2a8c82",
                    color: "#ffffff",
                    "&:hover": { bgcolor: "#1f645f" },
                  },
                  "&:hover:not(.Mui-selected)": {
                    bgcolor: "#E0E0E0",
                  },
                },
                "& .MuiPaginationItem-icon": { color: "#2a8c82" },
              }}
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Container>
      <DepositsDashboard depositsData={allDeposits} total={total} />
    </Box>
  );
};

export default DepositsPage;
