import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Pagination,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,

  SelectChangeEvent,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  getAllLoans,
  setPage,
} from "../../store/features/admin/adminLoanSlice";
import Loans from "../components/Loans/LoansDashboard/LoansDashboard";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import { useNavigate } from "react-router-dom";
import { StatusGeneric } from "../../common/indexTypes";

export const LoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();

  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const { allLoans, page, pageCount, status, total } = useSelector(
    (s: RootState) => s.AdminLoansSlice
  );
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const limit = 20;

  useEffect(() => {
    if (selectedUser?.id) {
      dispatch(
        getAllLoans({ page, limit, status: filter, userId: selectedUser.id })
      );
    } else {
      dispatch(getAllLoans({ page, limit, status: filter }));
    }
  }, [dispatch, page, filter, selectedUser]);

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
    dispatch(setPage(1));
  };

  return (
    <>
      <Box sx={{ minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          {/* HEADER */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              // bgcolor: "#FFFFFF",
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
                  src="https://img.icons8.com/color/48/loan.png"
                  alt="loan"
                />
                <Typography variant="h5" fontWeight={600} textAlign="center">
                  ניהול הלוואות
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
                  onClick={() => navigate("/loans/new")}
                  fullWidth={isSm}
                  sx={{
                    bgcolor: "#2a8c82",
                    // color: "#fff",
                    "&:hover": { bgcolor: "#1f645f" },
                  }}
                >
                  הוסף הלוואה
                </Button>
                {/* <RtlProvider> */}
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
                        // color: "#424242",
                        fontWeight: 500,
                        "&.Mui-focused": { color: "#2a8c82" },
                      }}
                    >
                      מצב הלוואה
                    </InputLabel>
                    <Select
                      labelId="filter-status-label"
                      value={filter}
                      label="מצב הלוואה"
                      onChange={handleFilterChange}
                   
                    >
                      <MenuItem value={StatusGeneric.ALL}>הכל</MenuItem>
                      <MenuItem value={StatusGeneric.ACTIVE}>פעילות</MenuItem>
                      <MenuItem value={StatusGeneric.INACTIVE}>
                        לא פעילות
                      </MenuItem>
                    </Select>
                  </FormControl>
                {/* </RtlProvider> */}
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
                // bgcolor: "#FFFFFF",
                overflowX: "auto",
              }}
            >
              <Loans loansData={allLoans} total={total} />
            </Box>
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
      </Box>
    </>
  );
};

export default LoansPage;
