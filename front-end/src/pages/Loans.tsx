// src/pages/LoansPage.tsx
import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { getAllLoans, setPage } from "../store/features/admin/adminLoanSlice";
import Loans from "../components/Loans/Loans";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";

export const LoansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allLoans, page, pageCount, status,total } = useSelector(
    (s: RootState) => s.adminLoansSlice
  );
  const limit = 20;
  console.log(allLoans, "all loans in LoansPage");
  useEffect(() => {
    dispatch(getAllLoans({ page, limit }));
  }, [dispatch, page]);

  return (
    <Box sx={{ p: 4 }}>
      {/* <Typography variant="h5" sx={{ mb: 2 }}>
        הלוואות (עמוד {page} מתוך {pageCount})
      </Typography> */}

      <Box component="ul" sx={{ listStyle: "none", p: 0 }}>
        {status === "pending" && <LoadingIndicator />}
      </Box>
      {pageCount > 1 && (
        <Box sx={{ display: "flex" , justifyContent: "space-between", mb: 2 }}>
                   <Button
            variant="contained"
            disabled={page >= pageCount}
            onClick={() => dispatch(setPage(page + 1))}
          >
           {"<"}
          </Button>

            <Typography variant="body1" sx={{ textAlign: "center" }}>
              עמוד {page} מתוך {pageCount}
            </Typography>
          
           <Button
            variant="contained"
            disabled={page <= 1}
            onClick={() => dispatch(setPage(page - 1))}
          >
          {">"}
          </Button>
        </Box>
      )}
      <Loans loansData={allLoans} total={total} />
    </Box>
  );
};

export default LoansPage;
