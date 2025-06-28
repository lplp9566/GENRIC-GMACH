import React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SummaryCard from "./SummaryCard";
import LoanCard from "./LoanCard";
import { ILoanWithUser } from "../LoanDto";
import { useNavigate } from "react-router-dom";

interface LoanProps {
  loansData: ILoanWithUser[];
  total: number;
}

const LoansDashboard: React.FC<LoanProps> = ({ loansData, total }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // סך כל הסכומים
  const totalAmount = loansData
    .reduce((sum, loan) => sum + loan.loan_amount, 0)
    .toLocaleString("he-IL");

  return (
    <Box sx={{ bgcolor: "#F5F5F5", py: 6, direction: "rtl" }}>
      <Container maxWidth="lg">
        {/* מסגרת לבנה לכל התוכן */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 6,
            bgcolor: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 2,
          }}
        >
          {/* Summary Section */}
          <Grid
            container
            spacing={2}
            justifyContent="center"
            mb={4}
          >
            <Grid item xs={12} sm={isSm? 6:3}>
              <SummaryCard
                label="מספר הלוואות"
                value={total}
              />
            </Grid>
            <Grid item xs={12} sm={isSm? 6:3}>
                            <SummaryCard
                label="סה״כ הלוואות"
                value={`₪${totalAmount}`}
              />
            </Grid>
          </Grid>

          {/* Loans Grid */}
          <Grid container spacing={4}>
            {loansData.map((loan) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={loan.id}
              >
                <LoanCard
                  loan={loan}
                  onClick={() => navigate(`/loans/${loan.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoansDashboard;
