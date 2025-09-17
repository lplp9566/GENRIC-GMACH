import { Box, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import  { FC } from "react";
export type DonationRow = {
  id: string | number;
  userName: string;
  amount: number;
  date: string;
  action: string;
  donation_reason: string;
};
export type SortBy = "date" | "amount";
export type SortDir = "asc" | "desc";
interface DonationsTableProps {
  isLoading: boolean;
  rows: DonationRow[];
  sortBy: SortBy;
  sortDir: SortDir;
  onSortClick: (key: SortBy) => void;
}
const DonationsTable: FC<DonationsTableProps> = ({ isLoading, rows, sortBy, sortDir, onSortClick }) => {
  
      if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }
  return    <Box sx={{ overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {/* לפי הדרישה: משתמש | סכום | תאריך | אמצעי תשלום | הערות */}
            <TableCell align="right">משתמש</TableCell>
            <TableCell align="right" sortDirection={sortBy === "amount" ? sortDir : false as any}>
              <TableSortLabel
                active={sortBy === "amount"}
                direction={sortBy === "amount" ? sortDir : "asc"}
                onClick={() => onSortClick("amount")}
              >
                סכום
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sortDirection={sortBy === "date" ? sortDir : false as any}>
              <TableSortLabel
                active={sortBy === "date"}
                direction={sortBy === "date" ? sortDir : "asc"}
                onClick={() => onSortClick("date")}
              >
                תאריך
              </TableSortLabel>
            </TableCell>
            <TableCell align="right"> פעולה</TableCell>
            <TableCell align="right">קרן/תרומה רגילה</TableCell>
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
            rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell align="right">{r.userName}</TableCell>
                <TableCell align="right" sx={{ color: "success.main", fontWeight: 700 }}>
                  {r.amount.toLocaleString("he-IL", { style: "currency", currency: "ILS" })}
                </TableCell>
                <TableCell align="right">{r.date}</TableCell>
                <TableCell align="right">{r.action == "donation" ? "תרומה" : "משיכה"}</TableCell>
                <TableCell align="right">{r.donation_reason == "Equity" ? "תרומה רגילה" : ` קרן ${r.donation_reason}`}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
};

export default DonationsTable;
;