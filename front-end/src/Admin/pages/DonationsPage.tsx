// src/pages/DonationsHomePage.tsx
import  { FC, useEffect, useMemo, useState } from "react";
import {
  Box, Container, Grid, Alert
} from "@mui/material";
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

const MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];


// --- Utils (נשארים בעמוד בשביל פשטות) ---
const normalizeKey = (s: any) => String(s ?? "").trim().toLowerCase();

function getDonationDate(d: any): Date | null {
  const raw = d?.date;
  if (!raw) return null;
  const t = new Date(raw);
  return isNaN(t.getTime()) ? null : t;
}

function getDonationCategory(d: any): { kind: "regular" | "fund"; key: string; label: string } {
  const reasonRaw = String(d?.donation_reason ?? "").trim();
  const rlow = reasonRaw.toLowerCase();
  const isRegular = !reasonRaw || rlow === "equity" || rlow === "equality";
  if (isRegular) return { kind: "regular", key: "__regular__", label: "תרומות רגילות" };
  return { kind: "fund", key: normalizeKey(reasonRaw), label: reasonRaw };
}

const DonationsHomePage:FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const AddDonationModal = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  // Redux state
  const { allDonations, status: adminDonationStatus, error } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const { status: fundsOverviewStatus, fundsOverview } = useSelector((s: RootState) => s.AdminFundsOverviewReducer);
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);

  // fetch base data
  useEffect(() => {
    if (adminDonationStatus === "idle") {
      
      dispatch(getAllDonations({} as any));
      // dispatch(getFundsOverview());
    }
    if (fundsOverviewStatus === "idle") {
      console.log("Fetching funds overview...");
      
      dispatch(getFundsOverview());
    }

  }, [dispatch, adminDonationStatus, fundsOverviewStatus]);

  const donationsSafe = Array.isArray(allDonations) ? allDonations : [];

  // אם נבחר משתמש — מסננים רק לתרומות שלו
  const donationsBase = useMemo(() => {
    if (!selectedUser) return donationsSafe;
    const uid = selectedUser?.id ?? selectedUser?.id ?? selectedUser?.id;
    return donationsSafe.filter((d) => {
      const donorId = d?.user?.id ?? d?.user.id ?? d?.id;
      return donorId === uid;
    });
  }, [donationsSafe, selectedUser]);

  // מצבים (UI)
  const [view, setView] = useState<ViewMode>("split");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // שנים וחודשים זמינים אחרי סינונים קיימים
  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    donationsBase.forEach((d) => {
      const dt = getDonationDate(d);
      if (dt) set.add(dt.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [donationsBase]);

  const monthOptions = useMemo(() => {
    const set = new Set<number>();
    donationsBase.forEach((d) => {
      const dt = getDonationDate(d);
      if (!dt) return;
      if (yearFilter !== "all" && dt.getFullYear() !== yearFilter) return;

      if (activeKey) {
        const cat = getDonationCategory(d);
        if (activeKey === "__regular__" && cat.kind !== "regular") return;
        if (activeKey !== "__regular__" && (cat.kind !== "fund" || cat.key !== activeKey)) return;
      }
      set.add(dt.getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [donationsBase, yearFilter, activeKey]);

  // ודא ש-monthFilter חוקי
  useEffect(() => {
    if (monthFilter !== "all" && !monthOptions.includes(monthFilter)) {
      setMonthFilter("all");
    }
  }, [monthOptions, monthFilter]);

  // סינון ראשי
  const filtered = useMemo(() => {
    return donationsBase.filter((d) => {
      const dt = getDonationDate(d);
      if (!dt) return false;

      const okYear = yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth = monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;

      if (!activeKey) return true;
      const cat = getDonationCategory(d);
      if (activeKey === "__regular__") return cat.kind === "regular";
      if (cat.kind === "fund") return cat.key === activeKey;
      return false;
    });
  }, [donationsBase, monthFilter, yearFilter, activeKey]);

  // מיון
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortBy === "date") {
        const ta = getDonationDate(a)?.getTime() ?? 0;
        const tb = getDonationDate(b)?.getTime() ?? 0;
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      const aa = Number(a?.amount) || 0;
      const bb = Number(b?.amount) || 0;
      return sortDir === "asc" ? aa - bb : bb - aa;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  // שורות לטבלה
  const rows: DonationRow[] = useMemo(() => {
    return sorted.map((d) => {
      const userName = [d?.user?.first_name, d?.user?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || "—";
      const dt = getDonationDate(d);
      return {
        id: d?.id ?? "—",
        userName,
        amount: Number(d?.amount) || 0,
        date: dt ? dt.toLocaleDateString("he-IL") : "—",
        action: d?.action ?? d?.action ?? "—",
        donation_reason: d?.donation_reason ?? d?.donation_reason ?? "—",
      };
    });
  }, [sorted]);

  const isLoading = adminDonationStatus === "pending";
  const isError = adminDonationStatus === "rejected";

  // KPI מבוסס סינון
  const kpiTotal = useMemo(() => rows.reduce((s, r) => s + (r.amount || 0), 0), [rows]);
  const kpiCount = rows.length;

  // פריסה: שמאל=טבלה, ימין=קרנות
  const leftCols = view === "left" ? 12 : view === "split" ? 6 : 0;
  const rightCols = view === "right" ? 12 : view === "split" ? 6 : 0;

  const handleSortClick = (key: SortBy) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  // כרטיסיות הקרנות — לפי משתמש אם יש, אחרת Overview
  const userSideTotals = useMemo(() => {
    if (!selectedUser) return null;
    let regular = 0;
    const fundMap = new Map<string, number>();

    donationsBase.forEach((d) => {
      const amt = Number(d?.amount) || 0;
      const cat = getDonationCategory(d);
      if (cat.kind === "regular") regular += amt;
      else fundMap.set(cat.key, (fundMap.get(cat.key) ?? 0) + amt);
    });

    const fundCards: FundCardData[] = Array.from(fundMap.entries()).map(([label, total]) => ({
      key: label,
      label,
      total,
    }));

    return { regularTotal: regular, fundCards };
  }, [donationsBase, selectedUser]);

  const fundDetails: Record<string, number> = fundsOverview?.fund_details ?? {};
  const overviewFundCards: FundCardData[] = useMemo(
    () =>
      Object.entries(fundDetails).map(([label, total]) => ({
        key: normalizeKey(label),
        label,
        total: Number(total || 0),
      })),
    [fundDetails]
  );

  const regularTotalFromOverview = Number(fundsOverview?.total_equity_donations ?? 0);
  const rightPanelRegularTotal = userSideTotals ? userSideTotals.regularTotal : regularTotalFromOverview;
  const rightPanelFundCards = userSideTotals ? userSideTotals.fundCards : overviewFundCards;

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      {AddDonationModal && <NewDonation />}
      <DonationHeader />

      <Box mt={4}>
        {isError && <Alert severity="error">{error || "אירעה שגיאה בטעינת תרומות"}</Alert>}

        <Grid container spacing={3}>
          {/* שמאל – טבלת תרומות (עם KPI+סלקטים) */}
          <Grid item xs={12} md={leftCols} sx={{ display: leftCols ? "block" : "none" }}>
            <Frame
              title="טבלת תרומות"
              expanded={view === "left"}
              onToggle={() => setView((v) => (v === "left" ? "split" : "left"))}
            >
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

          {/* ימין – קרנות */}
          <Grid item xs={12} md={rightCols} sx={{ display: rightCols ? "block" : "none" }}>
            <Frame
              title={selectedUser ? "קרנות (למשתמש הנבחר)" : "קרנות מיוחדות"}
              expanded={view === "right"}
              onToggle={() => setView((v) => (v === "right" ? "split" : "right"))}
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
