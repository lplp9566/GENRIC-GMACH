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
import EditDonationModal from "./EditDonationModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  setAddDonationDraft,
  setAddDonationModal,
} from "../../../store/features/Main/AppMode";
export type DonationRow = {
  id: string | number;
  userName: string;
  amount: number;
  date: string;
  action: string;
  donation_reason: string;
  note?: string;
  userId: number;
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
export const ddmmyyyyToInputDate = (s: string) => {
  if (!s) return "";

  const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";

  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
};
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
  const [selectedDonation, setSelectedDonation] = useState<DonationRow | null>(
    null
  );

  const onClickEdit = (donation: DonationRow) => {
    setSelectedDonation({
      ...donation,
      date: ddmmyyyyToInputDate(donation.date),
    });
    setEditMode(true);
  };
  const dispatch = useDispatch<AppDispatch>();

  const onClickDuplicate = (row: DonationRow) => {
    const reason = String(row.donation_reason ?? "").trim();
    const kind = reason.toLowerCase() === "equity" ? "regular" : "fund";

    dispatch(
      setAddDonationDraft({
        userId: row.userId,
        kind,
        fundName: kind === "fund" ? reason : "",
        amount: row.amount,
        date: ddmmyyyyToInputDate(row.date), // או לשים היום אם רוצים
      })
    );

    dispatch(setAddDonationModal(true));
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell align="right">תורם</TableCell>
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
            <TableCell align="right">פעולה</TableCell>
            <TableCell align="right">קרן/תרומה רגילה</TableCell>
            <TableCell align="right">הערות</TableCell>
            <TableCell align="right">פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                אין תרומות להצגה
              </TableCell>
            </TableRow>
          ) : (
            rows.map((donationRow) => (
              <TableRow
                key={donationRow.id}
                hover
                sx={{ cursor: "pointer" }}
              >
                <TableCell align="right">{donationRow.userName}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      donationRow.action == "withdraw"
                        ? "error.main"
                        : "success.main",
                    fontWeight: 700,
                  }}
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
                <TableCell align="right">{donationRow.note || "-"}</TableCell>
                <TableCell align="right">
                  <Tooltip title="שכפול תרומה">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickDuplicate(donationRow);
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="עריכה">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickEdit(donationRow);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="מחיקה (בקרוב)">
                    <span>
                      <IconButton disabled>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
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
