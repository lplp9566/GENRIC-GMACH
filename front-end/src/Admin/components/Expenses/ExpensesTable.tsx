import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { FC, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditExpenseModal from "./EditExpenseModal";

export type ExpenseRow = {
  id: string | number;
  amount: number;
  date: string;
  category: string;
  categoryId?: number | null;
  note?: string;
};

export type SortBy = "date" | "amount";
export type SortDir = "asc" | "desc";

interface ExpensesTableProps {
  isLoading: boolean;
  rows: ExpenseRow[];
  sortBy: SortBy;
  sortDir: SortDir;
  onSortClick: (key: SortBy) => void;
  onDuplicate: (row: ExpenseRow) => void; // ✅ חדש
}

const ExpensesTable: FC<ExpensesTableProps> = ({
  isLoading,
  rows,
  sortBy,
  sortDir,
  onSortClick,
  onDuplicate,
}) => {
  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={300}
      >
        <CircularProgress />
      </Box>
    );
  }

  const [editMode, setEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(
    null
  );

  const ddmmyyyyToInputDate = (s: string) => {
    if (!s) return "";
    const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return "";
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  };

  const onClickEdit = (row: ExpenseRow) => {
    setSelectedExpense({
      ...row,
      date: ddmmyyyyToInputDate(row.date),
    });
    setEditMode(true);
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="right">קטגוריה</TableCell>

            <TableCell
              align="right"
              sortDirection={sortBy === "amount" ? sortDir : (false as any)}
            >
              <TableSortLabel
                active={sortBy === "amount"}
                direction={sortBy === "amount" ? sortDir : "asc"}
                onClick={() => onSortClick("amount")}
              >
                סכום
              </TableSortLabel>
            </TableCell>

            <TableCell
              align="right"
              sortDirection={sortBy === "date" ? sortDir : (false as any)}
            >
              <TableSortLabel
                active={sortBy === "date"}
                direction={sortBy === "date" ? sortDir : "asc"}
                onClick={() => onSortClick("date")}
              >
                תאריך
              </TableSortLabel>
            </TableCell>

            <TableCell align="right">הערה</TableCell>
            <TableCell align="right">שכפל</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                אין נתונים להצגה
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onClickEdit(row)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell align="right">{row.category || "—"}</TableCell>

                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {row.amount.toLocaleString("he-IL", {
                    style: "currency",
                    currency: "ILS",
                  })}
                </TableCell>

                <TableCell align="right">{row.date}</TableCell>
                <TableCell align="right">{row.note || "—"}</TableCell>

                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="שכפל הוצאה">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(row); // ✅ כאן השכפול
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}

          {editMode && (
            <EditExpenseModal
              open={editMode}
              onClose={() => setEditMode(false)}
              expense={selectedExpense!}
            />
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExpensesTable;
