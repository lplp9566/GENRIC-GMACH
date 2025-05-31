// src/pages/LoansPage.tsx
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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { getAllLoans, setPage } from "../store/features/admin/adminLoanSlice";
import Loans from "../components/Loans/Loans";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import { LoanStatus } from "../common/indexTypes";
import { useNavigate } from "react-router-dom";

export const LoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
  const [filter, setFilter] = useState<LoanStatus>(LoanStatus.ALL);
  const { allLoans, page, pageCount, status, total } = useSelector(
    (s: RootState) => s.adminLoansSlice
  );
  const limit = 20;

  useEffect(() => {
    dispatch(getAllLoans({ page, limit, status: filter }));
  }, [dispatch, page, filter]);

  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as LoanStatus);
    dispatch(setPage(1));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* HEADER PAPER */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          bgcolor: "beige",
          width: "40%",
          mx: "auto",
          dir: "rtl",
        }}
      >
        <Stack spacing={2}>
          {/* Row 1: Title */}
          <Typography variant="h5" align="center" fontWeight={600}>
            ניהול הלוואות
          </Typography>

          {/* Row 2: Button & Select */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left: Add Loan */}
            <Button variant="contained" color="primary" onClick={() =>navigate("/loans/new")}>
              הוסף הלוואה
            </Button>

            {/* Right: Filter Select */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="filter-status-label">מצב הלוואה</InputLabel>
              <Select
                labelId="filter-status-label"
                value={filter}
                label="מצב הלוואה"
                onChange={handleFilterChange}
              >
                <MenuItem value={LoanStatus.ALL}>הכל</MenuItem>
                <MenuItem value={LoanStatus.ACTIVE}>פעילות</MenuItem>
                <MenuItem value={LoanStatus.INACTIVE}>לא פעילות</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </Paper>

      {/* SUMMARY BOX */}
      {/* <Box
        sx={{
          mb: 2,
          mx: "auto",
          maxWidth: 360,
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle1">
          מציג {allLoans.length} מתוך {total}
        </Typography>
      </Box> */}
        {status === "pending" && <LoadingIndicator  />}

      {/* LOANS TABLE */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Loans loansData={allLoans} total={total} />
      </Paper>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => dispatch(setPage(v))}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Container>
  );
};

export default LoansPage;
