// src/pages/DonationsHomePage.tsx
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import { getAllDonations } from "../../store/features/admin/adminDonationsSlice";
import { getFundsOverview } from "../../store/features/admin/adminFundsOverviewSlice";

import DonationsTable, { DonationRow, SortBy, SortDir } from "../components/Donations/DonationsTable";
import FundsPanel, { FundCardData } from "../components/Donations/FundPanel";
import FiltersBar from "../components/Donations/FiltersBar";
import Frame from "../components/Donations/Frame";
import KpiRow from "../components/Donations/KpiRow";
import DonationHeader from "../components/Donations/DonationHeader";
import NewDonation from "../components/Donations/NewDonation";

type ViewMode = "split" | "left" | "right";
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

// ------- Helpers -------
function parseDate(raw: any): Date | null {
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw));
  return isNaN(d.getTime()) ? null : d;
}
function formatDate(d: Date | null) {
  if (!d) return "—";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}
// זהות תורם (אם צריך לסנן לפי משתמש נבחר)
function getDonorId(d: any): string | null {
  const raw =
    (typeof d?.user === "object" && d?.user !== null ? (d.user.id ?? d.userId ?? d.user_id) : d?.user) ??
    d?.userId ?? d?.user_id;
  if (raw == null) return null;
  const key = String(raw).trim();
  return key || null;
}

// מיפוי fund_details → כרטיסי קרנות
function toFundCards(details: any): FundCardData[] {
  if (!details) return [];
  if (Array.isArray(details)) {
    return details.map((f: any) => {
      const name = f?.name ?? f?.label ?? f?.fund_name ?? f?.key ?? f?.donation_reason ?? "";
      const total = f?.value ?? f?.amount ?? f?.total ?? 0;
      return { key: String(name).trim().toLowerCase(), label: String(name), total: Number(total) || 0 };
    });
  }
  // Record<string, number>
  return Object.entries(details).map(([name, total]) => ({
    key: String(name).trim().toLowerCase(),
    label: String(name),
    total: Number(total) || 0,
  }));
}

// ------- Component -------
const DonationsHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux
  const addDonationModal = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  const { allDonations, status: donationsStatus, error } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const fundsOverview = useSelector((s: RootState) => s.AdminFundsOverviewReducer.fundsOverview);
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);

  // טעינה ראשונית
  useEffect(() => {
    if (donationsStatus === "idle") {
      dispatch(getAllDonations({} as any));
    }
    dispatch(getFundsOverview()); // תמיד נרענן את ה־overview מה-DB
  }, [dispatch, donationsStatus]);

  // רענון אחרי סגירת מודאל
  const wasOpen = useRef(addDonationModal);
  const [view, setView] = useState<ViewMode>("split");
  useEffect(() => {
    if (wasOpen.current && !addDonationModal) {
      dispatch(getAllDonations({} as any));
      dispatch(getFundsOverview());
      setView("split");
    }
    wasOpen.current = addDonationModal;
  }, [addDonationModal, dispatch]);

  // טבלת תרומות
  const donations = Array.isArray(allDonations) ? allDonations : [];
  const selectedUserId = selectedUser?.id != null ? String(selectedUser.id) : null;

  const donationsBase = useMemo(() => {
    if (!selectedUserId) return donations;
    return donations.filter((d: any) => getDonorId(d) === selectedUserId);
  }, [donations, selectedUserId]);

  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    donationsBase.forEach((d: any) => {
      const dt = parseDate(d?.date);
      if (dt) set.add(dt.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [donationsBase]);

  const monthOptions = useMemo(() => {
    const set = new Set<number>();
    donationsBase.forEach((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt) return;
      if (yearFilter !== "all" && dt.getFullYear() !== yearFilter) return;

      set.add(dt.getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [donationsBase, yearFilter]);

  useEffect(() => {
    if (monthFilter !== "all" && !monthOptions.includes(monthFilter)) {
      setMonthFilter("all");
    }
  }, [monthOptions, monthFilter]);

  const filtered = useMemo(() => {
    return donationsBase.filter((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt) return false;
      const okYear  = yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth = monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;
      return true;
    });
  }, [donationsBase, yearFilter, monthFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      if (sortBy === "date") {
        const ta = parseDate(a?.date)?.getTime() ?? 0;
        const tb = parseDate(b?.date)?.getTime() ?? 0;
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      const aa = Number(a?.amount) || 0;
      const bb = Number(b?.amount) || 0;
      return sortDir === "asc" ? aa - bb : bb - aa;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const rows: DonationRow[] = useMemo(() => {
    return sorted.map((d: any) => {
      const dt = parseDate(d?.date);
      return {
        id: d?.id ?? "—",
        userName: `${d.user?.first_name ?? ""} ${d.user?.last_name ?? ""}`.trim(),
        amount: Number(d?.amount) || 0,
        date: formatDate(dt),
        action: d?.action ?? "—",
        donation_reason: d?.donation_reason ?? "—",
      };
    });
  }, [sorted]);

  const isLoading = donationsStatus === "pending";
  const isError   = donationsStatus === "rejected";
  const kpiTotal  = useMemo(() => rows.reduce((s, r) => s + (r.amount || 0), 0), [rows]);
  const kpiCount  = rows.length;

  // --------- RIGHT PANEL: רק מה-DB ---------
  const rightPanelRegularTotal = Number(fundsOverview?.total_equity_donations) || 0;
  const rightPanelFundCards    = toFundCards(fundsOverview?.fund_details);

  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("desc"); }
  }

  return (
    <Container sx={{ py: 4, direction: "rtl", bgcolor: "#F9FBFC", fontFamily: "Heebo, Arial, sans-serif", minHeight: "100vh" }}>
      {addDonationModal && <NewDonation />}
      <DonationHeader />

      <Box mt={4}>
        {isError && <Alert severity="error">{error || "אירעה שגיאה בטעינת תרומות"}</Alert>}

        <Grid container spacing={3}>
          {/* שמאל – טבלת תרומות */}
          <Grid item xs={12} md={view === "left" ? 12 : view === "split" ? 6 : 0} sx={{ display: view === "right" ? "none" : "block" }}>
            <Frame title="טבלת תרומות" expanded={view === "left"} onToggle={() => setView(view === "left" ? "split" : "left")}>
              <KpiRow totalAmount={kpiTotal} totalDonations={kpiCount} view={view} />

              <FiltersBar
                yearFilter={yearFilter}
                monthFilter={monthFilter}
                yearOptions={yearOptions}
                monthOptions={monthOptions}
                monthsLabels={MONTHS}
                onChangeYear={setYearFilter}
                onChangeMonth={setMonthFilter}
              />

              <DonationsTable
                isLoading={isLoading}
                rows={rows}
                sortBy={sortBy}
                sortDir={sortDir}
                onSortClick={handleSortClick}
              />
            </Frame>
          </Grid>

          {/* ימין – קרנות (DB בלבד) */}
          <Grid item xs={12} md={view === "right" ? 12 : view === "split" ? 6 : 0} sx={{ display: view === "left" ? "none" : "block" }}>
            <Frame
              title="קרנות מיוחדות"
              expanded={view === "right"}
              onToggle={() => setView(view === "right" ? "split" : "right")}
            >
              <FundsPanel
                regularTotal={rightPanelRegularTotal}
                fundCards={rightPanelFundCards}
                activeKey={activeKey}
                onToggleKey={(k) => setActiveKey((prev) => (prev === k ? null : k))}
              />
            </Frame>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DonationsHomePage;
