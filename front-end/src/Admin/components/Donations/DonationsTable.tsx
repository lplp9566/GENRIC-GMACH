import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { FC, useState } from "react";
import EditDonationModal from "./EditDonationModal";
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
const DonationsTable: FC<DonationsTableProps> = ({
  isLoading,
  rows,
  sortBy,
  sortDir,
  onSortClick,
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
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState< DonationRow| null>(null);
  const ddmmyyyyToInputDate = (s: string) => {
  if (!s) return "";

  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
};

const onClickEdit = (donation: DonationRow) => {
  setSelectedDonation({
    ...donation,
    date: ddmmyyyyToInputDate(donation.date),
  });
  setEditMode(true);
};

  return (
    <Box sx={{ overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {/* לפי הדרישה: משתמש | סכום | תאריך | אמצעי תשלום | הערות */}
            <TableCell align="right">משתמש</TableCell>
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
            rows.map((donationRow) => (
              <TableRow key={donationRow.id} hover onClick={() => onClickEdit(donationRow)} sx={{cursor: 'pointer'}}>
                <TableCell align="right">{donationRow.userName}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "success.main", fontWeight: 700 }}
                >
                  {donationRow.amount.toLocaleString("he-IL", {
                    style: "currency",
                    currency: "ILS",
                  })}
                </TableCell>
                <TableCell align="right">{donationRow.date}</TableCell>
                <TableCell align="right">
                  {donationRow.action == "donation" ? "תרומה" : "משיכה"}
                </TableCell>
                <TableCell align="right">
                  {donationRow.donation_reason == "Equity"
                    ? "תרומה רגילה"
                    : ` קרן ${donationRow.donation_reason}`}
                </TableCell>
              </TableRow>
            ))
          )}
          {editMode && (
            <EditDonationModal
              open={editMode}
              onClose={() => setEditMode(false)}
              donation={selectedDonation!}
            />
          )}

        </TableBody>
      </Table>
 
    </Box>
  );
};

export default DonationsTable;
