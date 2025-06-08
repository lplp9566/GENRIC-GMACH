// LoansDashboardWithComponents.tsx
import React from "react";
import { Box, Container, Grid } from "@mui/material";
import SummaryCard from "./SummaryCard";
import LoanCard from "./LoanCard";
import { ILoan } from "../LoanDto";
import { useNavigate } from "react-router-dom";

interface LoanProps {
  loansData: ILoan[];
  total: number;
}

const LoansDashboard: React.FC<LoanProps> = ({ loansData, total }) => {
  const navigate = useNavigate();
  const totalAmount = loansData.reduce((sum, loan) => sum + loan.loan_amount, 0);

  return (
    <Box sx={{ backgroundColor: "#F5F5F5", minHeight: "100vh", pt: 4, pb: 6, direction: "rtl" }}>
      <Container maxWidth="lg">
        {/* Summary */}
        <Box display="flex" justifyContent="center" gap={2} mb={4}>
          <SummaryCard label="מספר הלוואות" value={total} />
          <SummaryCard label="סה״כ הלוואות" value={`₪${totalAmount.toLocaleString()}`} />
        </Box>

        {/* Loans Grid */}
        <Grid container spacing={4}>
          {loansData.map((loan) => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <LoanCard loan={loan} onClick={() => navigate(`/loans/${loan.id}`)} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LoansDashboard;
