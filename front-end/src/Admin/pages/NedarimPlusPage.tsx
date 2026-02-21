import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { api } from "../../store/axiosInstance";

type NedarimRow = {
  id: string;
  date: string;
  user: string;
  amount: string;
  currency?: string;
  actionNumber: string;
  transactionType?: string;
  category?: string;
  comments?: string;
};

type NedarimSource = "credit" | "standing-order";

const MAX_ID = import.meta.env.VITE_NEDARIM_MAX_ID ?? "2000";

const parseDate = (value: string) => {
  if (!value) return null;
  const dmy = value.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (dmy) {
    const d = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const ymd = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;
  return null;
};

const toDateLabel = (value: string) => {
  const d = parseDate(value);
  if (!d) return value || "-";
  return d.toLocaleDateString("he-IL");
};

const toCurrencyCode = (currency?: string) => {
  const c = (currency ?? "").toLowerCase().trim();
  if (c === "2" || c.includes("usd") || c.includes("dollar") || c.includes("$")) {
    return "USD";
  }
  return "ILS";
};

const toAmountLabel = (value: string, currency?: string) => {
  if (!value) return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  const code = toCurrencyCode(currency);
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(n);
};

const NedarimPlusPage: FC = () => {
  const [rows, setRows] = useState<NedarimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<NedarimSource>("credit");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const [creditCursorHistory, setCreditCursorHistory] = useState<string[]>([""]);
  const [creditPageIndex, setCreditPageIndex] = useState(0);
  const [creditHasMore, setCreditHasMore] = useState(false);
  const [creditNextLastId, setCreditNextLastId] = useState("");

  const getRangeForStandingOrder = (year: string, month: string) => {
    const today = new Date();
    const toDdMmYyyy = (d: Date) => {
      const dd = `${d.getDate()}`.padStart(2, "0");
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    if (year === "all") {
      return {
        from: "01/01/2000",
        to: toDdMmYyyy(today),
      };
    }

    const y = Number(year);
    if (month === "all") {
      return {
        from: `01/01/${y}`,
        to: `31/12/${y}`,
      };
    }

    const m = Number(month);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return {
      from: toDdMmYyyy(start),
      to: toDdMmYyyy(end),
    };
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const currentCreditLastId = creditCursorHistory[creditPageIndex] ?? "";
      const baseParams: Record<string, string> =
        source === "standing-order"
          ? yearFilter === "all"
            ? { source }
            : {
                source,
                ...getRangeForStandingOrder(yearFilter, monthFilter),
              }
          : {
              source,
              maxId: MAX_ID,
              lastId: currentCreditLastId,
            };

      const response = await api.get("/nedarim-plus/actions", { params: baseParams });
      const data = ((response.data as any)?.data ?? []) as NedarimRow[];
      const paging = (response.data as any)?.paging ?? {};

      setRows(data);

      if (source === "credit") {
        setCreditHasMore(Boolean(paging?.hasMore));
        setCreditNextLastId(String(paging?.nextLastId ?? ""));
      } else {
        setCreditHasMore(false);
        setCreditNextLastId("");
      }
    } catch {
      setRows([]);
      setCreditHasMore(false);
      setCreditNextLastId("");
      setError("שליפת נתוני נדרים פלוס נכשלה.");
    } finally {
      setLoading(false);
    }
  }, [source, yearFilter, monthFilter, creditCursorHistory, creditPageIndex]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCreditCursorHistory([""]);
    setCreditPageIndex(0);
    setCreditHasMore(false);
    setCreditNextLastId("");
  }, [source]);

  const years = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((row) => {
      const d = parseDate(row.date);
      if (d) set.add(d.getFullYear());
    });
    return [...set].sort((a, b) => b - a);
  }, [rows]);

  const months = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((row) => {
      const d = parseDate(row.date);
      if (!d) return;
      if (yearFilter !== "all" && d.getFullYear() !== Number(yearFilter)) return;
      set.add(d.getMonth() + 1);
    });
    return [...set].sort((a, b) => a - b);
  }, [rows, yearFilter]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const d = parseDate(row.date);
      if (!d) return yearFilter === "all" && monthFilter === "all";
      if (yearFilter !== "all" && d.getFullYear() !== Number(yearFilter)) return false;
      if (monthFilter !== "all" && d.getMonth() + 1 !== Number(monthFilter)) return false;
      return true;
    });
  }, [rows, yearFilter, monthFilter]);

  const handleYearChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setYearFilter(value);
    setMonthFilter("all");
  };

  const handleMonthChange = (event: SelectChangeEvent) => {
    setMonthFilter(event.target.value);
  };

  const handleSourceChange = (event: SelectChangeEvent) => {
    setSource(event.target.value as NedarimSource);
  };

  const handleCreditNextPage = () => {
    if (loading || !creditHasMore || !creditNextLastId) return;
    setCreditCursorHistory((prev) => [...prev.slice(0, creditPageIndex + 1), creditNextLastId]);
    setCreditPageIndex((prev) => prev + 1);
  };

  const handleCreditPrevPage = () => {
    if (loading || creditPageIndex <= 0) return;
    setCreditPageIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Paper sx={{ p: 3, borderRadius: 2, direction: "rtl" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                נדרים פלוס
              </Typography>
              <Typography variant="body2" color="text.secondary">
                טבלת פעולות: תאריך, משתמש, סכום ומספר פעולה
              </Typography>
            </Box>
            <Button variant="contained" onClick={loadData} disabled={loading}>
              רענון נתונים
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="source-filter-label">קטגוריה</InputLabel>
              <Select
                labelId="source-filter-label"
                value={source}
                label="קטגוריה"
                onChange={handleSourceChange}
              >
                <MenuItem value="credit">פעולות אשראי</MenuItem>
                <MenuItem value="standing-order">הוראת קבע</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="year-filter-label">שנה</InputLabel>
              <Select
                labelId="year-filter-label"
                value={yearFilter}
                label="שנה"
                onChange={handleYearChange}
              >
                <MenuItem value="all">הכל</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={String(year)}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="month-filter-label">חודש</InputLabel>
              <Select
                labelId="month-filter-label"
                value={monthFilter}
                label="חודש"
                onChange={handleMonthChange}
              >
                <MenuItem value="all">הכל</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month} value={String(month)}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {source === "credit" && (creditPageIndex > 0 || creditHasMore) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <IconButton
                onClick={handleCreditPrevPage}
                disabled={loading || creditPageIndex === 0}
                size="small"
                aria-label="עמוד קודם"
              >
                <ChevronRightIcon />
              </IconButton>
              <Typography variant="body2">עמוד {creditPageIndex + 1}</Typography>
              <IconButton
                onClick={handleCreditNextPage}
                disabled={loading || !creditHasMore || !creditNextLastId}
                size="small"
                aria-label="עמוד הבא"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      תאריך
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      משתמש
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      סכום
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      סוג עסקה
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      קטגוריה
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      הערות
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {source === "standing-order" ? "מזהה הוראת קבע" : "מספר פעולה"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        אין נתונים להצגה
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <TableRow key={row.id || `${row.actionNumber}-${idx}`} hover>
                        <TableCell align="right">{toDateLabel(row.date)}</TableCell>
                        <TableCell align="right">{row.user || "-"}</TableCell>
                        <TableCell align="right">{toAmountLabel(row.amount, row.currency)}</TableCell>
                        <TableCell align="right">{row.transactionType || "-"}</TableCell>
                        <TableCell align="right">{row.category || "-"}</TableCell>
                        <TableCell align="right">{row.comments || "-"}</TableCell>
                        <TableCell align="right">{row.actionNumber || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default NedarimPlusPage;
