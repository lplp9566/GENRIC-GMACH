import React, { useMemo, useState } from "react";
import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { InvestmentTransactionType, TransactionDto } from "../InvestmentDto";

type SortField = "date" | "action_type" | "amount";
type SortDirection = "asc" | "desc";

interface InvestmentActionTableProps {
  actions: TransactionDto[];
  title?: string;
  showInvestmentColumn?: boolean;
}

const INVESTMENT_ACTION_TYPES: {
  value: InvestmentTransactionType;
  label: string;
}[] = [
  { value: InvestmentTransactionType.INITIAL_INVESTMENT, label: "פתיחת השקעה" },
  { value: InvestmentTransactionType.ADDITIONAL_INVESTMENT, label: "הוספה להשקעה" },
  { value: InvestmentTransactionType.VALUE_UPDATE, label: "עדכון ערך" },
  { value: InvestmentTransactionType.WITHDRAWAL, label: "משיכה מהשקעה" },
  { value: InvestmentTransactionType.MANAGEMENT_FEE, label: "דמי ניהול" },
];

const InvestmentActionTable: React.FC<InvestmentActionTableProps> = ({
  actions,
  title,
  showInvestmentColumn,
}) => {
  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>("asc");

  const ACTION_ORDER: InvestmentTransactionType[] = [
    InvestmentTransactionType.INITIAL_INVESTMENT,
    InvestmentTransactionType.ADDITIONAL_INVESTMENT,
    InvestmentTransactionType.VALUE_UPDATE,
    InvestmentTransactionType.WITHDRAWAL,
    InvestmentTransactionType.MANAGEMENT_FEE,
  ];

  const handleHeaderClick = (field: SortField) => {
    if (field === currentSortField) {
      setCurrentSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setCurrentSortField(field);
      setCurrentSortDirection("asc");
    }
  };

  const sortedActions = useMemo(() => {
    const dir = currentSortDirection === "asc" ? 1 : -1;
    const orderMap = new Map(ACTION_ORDER.map((t, i) => [t, i]));
    const copy = [...actions];
    copy.sort((a, b) => {
      let cmp = 0;
      if (currentSortField === "date") {
        cmp =
          new Date(a.transaction_date).getTime() -
          new Date(b.transaction_date).getTime();
      } else if (currentSortField === "amount") {
        cmp = Number(a.amount) - Number(b.amount);
      } else {
        const idxA =
          orderMap.get(a.transaction_type as InvestmentTransactionType) ?? 0;
        const idxB =
          orderMap.get(b.transaction_type as InvestmentTransactionType) ?? 0;
        cmp = idxA - idxB;
      }
      return cmp * dir;
    });
    return copy;
  }, [actions, currentSortField, currentSortDirection]);

  const renderSortIndicator = (field: SortField) =>
    currentSortField === field
      ? currentSortDirection === "asc"
        ? " ▲"
        : " ▼"
      : "";

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}>
        {title ?? "פעולות על השקעות"}
      </Typography>

      {actions.length === 0 && <Typography>לא נמצאו פעולות</Typography>}

      {actions.length > 0 && (
        <Table size="small" sx={{ borderSpacing: "0 6px" }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  fontWeight: 700,
                  cursor: "pointer",
                },
              }}
            >
              {showInvestmentColumn && <TableCell align="right">השקעה</TableCell>}
              <TableCell align="right" onClick={() => handleHeaderClick("date")}>
                תאריך{renderSortIndicator("date")}
              </TableCell>
              <TableCell align="right">תאריך עדכון</TableCell>
              <TableCell align="center" onClick={() => handleHeaderClick("action_type")}>
                סוג פעולה{renderSortIndicator("action_type")}
              </TableCell>
              <TableCell align="left" onClick={() => handleHeaderClick("amount")}>
                סכום{renderSortIndicator("amount")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedActions.map((action) => (
              <TableRow key={action.id} hover sx={{ "& td": { border: "none" } }}>
                {showInvestmentColumn && (
                  <TableCell align="right">
                    {action.investment
                      ? `#${action.investment.id} - ${action.investment.investment_name ?? ""}`
                      : "—"}
                  </TableCell>
                )}
                <TableCell align="right">
                  {new Date(action.transaction_date).toLocaleDateString("he-IL")}
                </TableCell>
                <TableCell align="right">
                  {action.investment?.updated_at
                    ? new Date(action.investment.updated_at).toLocaleDateString("he-IL")
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      INVESTMENT_ACTION_TYPES.find(
                        (item) => item.value === action.transaction_type
                      )?.label || action.transaction_type
                    }
                    size="small"
                    color={
                      action.transaction_type ===
                        InvestmentTransactionType.INITIAL_INVESTMENT ||
                      action.transaction_type ===
                        InvestmentTransactionType.ADDITIONAL_INVESTMENT
                        ? "success"
                        : action.transaction_type === InvestmentTransactionType.VALUE_UPDATE
                        ? "info"
                        : action.transaction_type === InvestmentTransactionType.WITHDRAWAL
                        ? "error"
                        : action.transaction_type === InvestmentTransactionType.MANAGEMENT_FEE
                        ? "warning"
                        : "default"
                    }
                  />
                </TableCell>
                <TableCell align="left" sx={{ fontWeight: 600, color: "#007BFF" }}>
                  ₪{Number(action.amount ?? 0).toLocaleString("he-IL")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default InvestmentActionTable;

