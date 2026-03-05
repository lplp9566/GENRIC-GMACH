import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { FC, useState } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditExpenseModal from "./EditExpenseModal";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmModal from "../genricComponents/confirmModal";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import { deleteExpenseById } from "../../../store/features/admin/adminExpensesSlice";
import { ddmmyyyyToInputDate } from "../../Hooks/genricFunction";

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
  onDuplicate: (row: ExpenseRow) => void;
  readOnly?: boolean;
}

const ExpensesTable: FC<ExpensesTableProps> = ({
  isLoading,
  rows,
  sortBy,
  sortDir,
  onSortClick,
  onDuplicate,
  readOnly,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  const dispatch = useDispatch<AppDispatch>();

  const [editMode, setEditMode] = useState(false);
  const [delateMode, setDelateMode] = useState(false);
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);

  const openEdit = (row: ExpenseRow) => {
    setSelectedExpense({
      ...row,
      date: ddmmyyyyToInputDate(row.date),
    });
    setEditMode(true);
  };

  const handelDelete = () => {
    try {
      toast.promise(dispatch(deleteExpenseById(Number(selectedExpense?.id!))).unwrap(), {
        pending: "מוחק הוצאה...",
        success: "ההוצאה נמחקה בהצלחה! 👌",
        error: "שגיאה במחיקת ההוצאה 💥",
      });
      setDelateMode(false);
    } catch {
      // handled by toast
    }
  };

  const onClickEdit = (row: ExpenseRow) => {
    setSelectedExpense({
      ...row,
      date: ddmmyyyyToInputDate(row.date),
    });
    setEditMode(true);
  };

  const handleRowsLimitChange = (event: SelectChangeEvent) => {
    setRowsLimit(event.target.value as "10" | "30" | "all");
  };

  const displayedRows = rowsLimit === "all" ? rows : rows.slice(0, Number(rowsLimit));

  return (
    <Box sx={{ overflow: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Box />
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
          <InputLabel id="expenses-limit-label">תצוגה</InputLabel>
          <Select
            labelId="expenses-limit-label"
            label="תצוגה"
            value={rowsLimit}
            onChange={handleRowsLimitChange}
          >
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="30">30</MenuItem>
            <MenuItem value="all">הכל</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="right">קטגוריה</TableCell>

            <TableCell align="right" sortDirection={sortBy === "amount" ? sortDir : (false as any)}>
              <TableSortLabel
                active={sortBy === "amount"}
                direction={sortBy === "amount" ? sortDir : "asc"}
                onClick={() => onSortClick("amount")}
              >
                סכום
              </TableSortLabel>
            </TableCell>

            <TableCell align="right" sortDirection={sortBy === "date" ? sortDir : (false as any)}>
              <TableSortLabel
                active={sortBy === "date"}
                direction={sortBy === "date" ? sortDir : "asc"}
                onClick={() => onSortClick("date")}
              >
                תאריך
              </TableSortLabel>
            </TableCell>

            <TableCell align="right">הערה</TableCell>
            {!readOnly && <TableCell align="right">פעולות</TableCell>}
          </TableRow>
        </TableHead>

        <TableBody>
          {displayedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                אין נתונים להצגה
              </TableCell>
            </TableRow>
          ) : (
            displayedRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => {
                  if (readOnly) return;
                  onClickEdit(row);
                }}
                sx={{ cursor: readOnly ? "default" : "pointer" }}
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

                {!readOnly && (
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="שכפל הוצאה">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(row);
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="עריכה הוצאה">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(row);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחיקת הוצאה">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedExpense(row);
                          setDelateMode(true);
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}

          {editMode && !readOnly && (
            <EditExpenseModal
              open={editMode}
              onClose={() => setEditMode(false)}
              expense={selectedExpense!}
            />
          )}

          {delateMode && !readOnly && (
            <ConfirmModal
              open={delateMode}
              onClose={() => setDelateMode(false)}
              onSubmit={handelDelete}
              text="האם אתה בטוח שברצונך למחוק את ההוצאה"
            />
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExpensesTable;
