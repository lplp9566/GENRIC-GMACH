import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getAllLoanActions } from "../../store/features/admin/adminLoanSlice";

export const LoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const loanId = Number(id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loan = useSelector((state: RootState) =>
    state.adminLoansSlice.allLoans?.find((l) => l.id === loanId)
  );
  const actions = useSelector((state: RootState) =>
    state.adminLoansSlice.loanActions?.filter((a) => a.loan.id === loanId) || []
  );

  useEffect(() => {
    if (loanId) {
      dispatch(getAllLoanActions());
    }
  }, [dispatch, loanId]);

  if (!loan) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          טוען פרטי הלוואה...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        direction: "rtl",
        backgroundColor: "#F5F7FA",
      }}
    >
      {/* Back Button */}
      <Button
        variant="text"
        onClick={() => navigate(-1)}
        sx={{
          mb: 4,
          color: "#555",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        }}
        startIcon={<ArrowBackIcon sx={{ ml: 1 }} />}
      >
        חזור לדף הלוואות
      </Button>

      {/* Main Title */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{ mb: 4, fontWeight: 700, color: "#333" }}
      >
        פרטי הלוואה עבור:{" "}
        <Box component="span" sx={{ color: "#007BFF" }}>
          {loan.user.first_name} {loan.user.last_name}
        </Box>
      </Typography>
      <Divider sx={{ mb: 5 }} />

      {/* Grid: פרטים משמאל, טבלה מימין */}
      <Grid container spacing={4} flexDirection="row-reverse">
        {/* Loan Details */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, p: 3 }}>
            <CardContent>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600, color: "#333", mb: 3 }}
              >
                פרטי הלוואה כלליים
              </Typography>
              <Grid container spacing={3}>
                {[
                  {
                    label: "סכום הלוואה",
                    value: `₪${loan.loan_amount.toLocaleString()}`,
                    color: "#007BFF",
                  },
                  {
                    label: "תאריך הלוואה",
                    value: loan.loan_date,
                    color: "text.primary",
                  },
                  { label: "מטרה", value: loan.purpose, color: "text.primary" },
                  {
                    label: "תשלום חודשי",
                    value: `₪${loan.monthly_payment.toLocaleString()}`,
                    color: "#28A960",
                  },
                  {
                    label: "יום תשלום בחודש",
                    value: loan.payment_date,
                    color: "#FD7E14",
                  },
                  {
                    label: "סטטוס",
                    value: (
                      <Chip
                        label={loan.isActive ? "פעיל" : "סגור"}
                        color={loan.isActive ? "success" : "default"}
                        sx={{ fontWeight: 600 }}
                      />
                    ),
                    color: "",
                  },
                  {
                    label: "יתרה נוכחית",
                    value: `₪${loan.remaining_balance.toLocaleString()}`,
                    color: "#DC3545",
                  },
                  {
                    label: "תשלום חודשי התחלתי",
                    value: `₪${loan.initialMonthlyPayment.toLocaleString()}`,
                    color: "text.primary",
                  },
                  {
                    label: "סה\"כ תשלומים",
                    value: loan.total_installments,
                    color: "text.primary",
                  },
                  {
                    label: "בלאנס",
                    value: `₪${loan.balance.toLocaleString()}`,
                    color: "text.primary",
                  },
                ].map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: "#F8F9FA",
                        borderRadius: 1,
                        borderLeft: `4px solid ${
                          item.color === "text.primary"
                            ? "#CCC"
                            : item.color === ""
                            ? "transparent"
                            : item.color
                        }`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {item.label}
                      </Typography>
                      {typeof item.value === "string" ? (
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 700, color: item.color }}
                        >
                          {item.value}
                        </Typography>
                      ) : (
                        item.value
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Actions Table */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 600, color: "#333", mb: 2 }}
            >
              פעולות על הלוואה
            </Typography>
            <Box sx={{ overflowX: "auto", flexGrow: 1 }}>
              <Table
                size="medium"
                sx={{
                  minWidth: 250,
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        borderBottom: "none",
                        fontWeight: 700,
                        color: "#555",
                        backgroundColor: "#F8F9FA",
                      },
                    }}
                  >
                    <TableCell>סוג פעולה</TableCell>
                    <TableCell>תאריך</TableCell>
                    <TableCell
                      align="left"
                      sx={{ borderRadius: "0 8px 8px 0" }}
                    >
                      סכום
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actions.length > 0 ? (
                    actions.map((act) => (
                      <TableRow
                        key={act.id}
                        hover
                        sx={{
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
                          backgroundColor: "#FFFFFF",
                          boxShadow: 1,
                          borderRadius: 2,
                          mb: 1,
                          "& td": { border: "none" },
                        }}
                      >
                        <TableCell>{act.action_type}</TableCell>
                        <TableCell>{act.date}</TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            fontWeight: 600,
                            color: "#007BFF",
                            borderRadius: "0 8px 8px 0",
                          }}
                        >
                          ₪{act.value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          textAlign: "center",
                          py: 3,
                          color: "text.secondary",
                        }}
                      >
                        אין פעולות להלוואה זו.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Action Button */}
      <Box mt={4} textAlign="center">
        <Button
          variant="outlined"
          size="large"
          startIcon={<AddCircleOutlineIcon sx={{ ml: 1 }} />}
          onClick={() => navigate(`/loans/${loanId}/actions/new`)}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            borderWidth: 2,
            "&:hover": { borderWidth: 2 },
          }}
        >
          הוסף פעולה חדשה
        </Button>
      </Box>
    </Box>
  );
};

export default LoanDetails;
