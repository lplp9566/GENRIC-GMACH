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
  const selectedUser = useSelector(
    (state: RootState) => state.adminUsers.selectedUser
  );
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
    setFilter(e.target.value as LoanStatus);
    dispatch(setPage(1));
  };
  return (
    <Box sx={{ backgroundColor: "#F8F8F8"}}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            width: "40%",
            mx: "auto",
            dir: "rtl",
          }}
        >
          <Stack spacing={2}>
            {/* Row 1: Title */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" align="center" fontWeight={600}>
                ניהול הלוואות
              </Typography>
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/color/48/loan.png"
                alt="loan"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/loans/new")}
                sx={{
                  backgroundColor: "green", // טורקיז כצבע ראשי לכפתור
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgb(26, 29, 27)", // טורקיז כהה יותר במעבר עכבר
                  },
                }}
              >
                הוסף הלוואה
              </Button>

              {/* Right: Filter Select */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel
                  id="filter-status-label"
                  sx={{
                    color: "#424242", // אפור כהה ורך יותר לכיתוב
                    fontWeight: 500,
                    // כשה־Select בפוקוס, שיהיה בצבע טורקיז:
                    "&.Mui-focused": {
                      color: "#2a8c82",
                    },
                  }}
                >
                  מצב הלוואה
                </InputLabel>

                <Select
                  labelId="filter-status-label"
                  value={filter}
                  label="מצב הלוואה"
                  onChange={handleFilterChange}
                  sx={{
                    bgcolor: "transparent",
                    color: "#424242", // אפור כהה ורך יותר לטקסט בתוך ה־Select
                    borderRadius: 1,
                    // נוסיף גבול קונטינואס בכל המצבים:
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#B0B0B0", // אפור נייטרלי עדין לגבול ברירת מחדל
                      borderWidth: 1,
                    },
                    // כשכפתור ה־Select נמצא במצב hover:
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2a8c82", // טורקיז במעבר עכבר
                    },
                    // וכשה־Select בפוקוס:
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2a8c82", // טורקיז בפוקוס
                      borderWidth: 1.5,
                    },
                    // כדי שה־dropdown עצמו יקבל מעט מרווח פנימי:
                    "& .MuiSelect-select": {
                      padding: "6px 12px",
                    },
                  }}
                >
                  <MenuItem value={LoanStatus.ALL}>הכל</MenuItem>
                  <MenuItem value={LoanStatus.ACTIVE}>פעילות</MenuItem>
                  <MenuItem value={LoanStatus.INACTIVE}>לא פעילות</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Paper>

        {status === "pending" && <LoadingIndicator />}

        {/* LOANS TABLE */}
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: "#FFFFFF" /* לבן נקי לטבלת ההלוואות */ }}>
          <Loans loansData={allLoans} total={total} />
        </Paper>

        {/* PAGINATION */}
        {pageCount > 1 && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, v) => dispatch(setPage(v))}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#424242", // צבע טקסט ברירת מחדל לכפתורי פאגינציה
                  "&.Mui-selected": {
                    backgroundColor: "#2a8c82", // רקע טורקיז לעמוד הנבחר
                    color: "#FFFFFF", // טקסט לבן לעמוד הנבחר
                    "&:hover": {
                      backgroundColor: "#1e7b72", // טורקיז כהה יותר במעבר עכבר על עמוד נבחר
                    },
                  },
                  "&:hover:not(.Mui-selected)": {
                    backgroundColor: "#E0E0E0", // אפור בהיר במעבר עכבר על עמודים לא נבחרים
                  },
                },
                "& .MuiPaginationItem-icon": {
                  color: "#2a8c82", // צבע טורקיז לאייקוני החיצים
                },
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
  );
};

export default LoansPage;