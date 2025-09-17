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

// --------------------------------------------------
// UI consts
// --------------------------------------------------
type ViewMode = "split" | "left" | "right";
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

// --------------------------------------------------
// Helpers (פשוטים וברורים)
// --------------------------------------------------
function normalizeKey(s: any) {
  return String(s ?? "").trim().toLowerCase();
}

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

function getDonationCategory(d: any): { kind: "regular" | "fund"; key: string; label: string } {
  const reasonRaw = String(d?.donation_reason ?? "").trim();
  const rlow = reasonRaw.toLowerCase();
  const isRegular = !reasonRaw || rlow === "equity" || rlow === "equality";
  if (isRegular) return { kind: "regular", key: "__regular__", label: "תרומות רגילות" };
  return { kind: "fund", key: normalizeKey(reasonRaw), label: reasonRaw };
}

// מחלץ מזהה תורם גם כש- d.user הוא **מספר** (כמו בדוגמה שלך)
function getDonorId(d: any): string | null {
  const raw =
    (typeof d?.user === "object" && d?.user !== null ? (d.user.id ?? d.userId ?? d.user_id) : d?.user) ??
    d?.userId ?? d?.user_id;
  if (raw == null) return null;
  const key = String(raw).trim();
  return key || null;
}

// מחלץ שם מלא – קודם מאובייקט התרומה, אח"כ selectedUser, אח"כ מהמפה ב־Redux
function getDonorFullName(d: any, selectedUser: any, usersById: Map<string, any>): string {
  // 1) יש user עם שם פרטי/משפחה בתוך התרומה?
  const first = d?.user?.first_name ?? d?.user?.firstName ?? "";
  const last  = d?.user?.last_name  ?? d?.user?.lastName  ?? "";
  const byNested = `${first} ${last}`.trim();
  if (byNested) return byNested;

  // 2) אם מסונן לפי משתמש וה־id תואם – קח מה-selectedUser
  const donorId = getDonorId(d);
  if (donorId && selectedUser?.id != null && String(selectedUser.id) === donorId) {
    const selFirst = selectedUser?.first_name ?? selectedUser?.firstName ?? "";
    const selLast  = selectedUser?.last_name  ?? selectedUser?.lastName  ?? "";
    const bySelected = `${selFirst} ${selLast}`.trim();
    if (bySelected) return bySelected;
  }

  // 3) מהמפה ב־Redux (AdminUsers)
  if (donorId && usersById.has(donorId)) {
    const u = usersById.get(donorId);
    const uFirst = u?.first_name ?? u?.firstName ?? "";
    const uLast  = u?.last_name  ?? u?.lastName  ?? "";
    const byMap = `${uFirst} ${uLast}`.trim();
    if (byMap) return byMap;
  }

  // 4) אין – מציגים מקף (כדי שלא יהיה #id)
  return "—";
}

// מחשב קרנות “און דה פליי” מכל התרומות (מתעדכן מיד אחרי הוספה)
function computeOverviewFromDonations(donations: any[]): { regularTotal: number; fundCards: FundCardData[] } {
  let regular = 0;
  const fundMap = new Map<string, number>();
  donations.forEach((d) => {
    const amt = Number(d?.amount ?? 0) || 0;
    const cat = getDonationCategory(d);
    if (cat.kind === "regular") regular += amt;
    else fundMap.set(cat.key, (fundMap.get(cat.key) ?? 0) + amt);
  });
  const fundCards: FundCardData[] = Array.from(fundMap.entries()).map(([key, total]) => ({ key, label: key, total }));
  return { regularTotal: regular, fundCards };
}

// --------------------------------------------------
// Component
// --------------------------------------------------
const DonationsHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const addDonationModal = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  const { allDonations, status: donationsStatus, error } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);

  // רשימת משתמשים ל־id->user (לוקחים מכל וריאציה נפוצה של ה-slice)
  const usersList = useSelector((s: RootState) => {
    const any = s as any;
    const arr: any[] = [];
    if (any?.AdminUsers?.entities) arr.push(...Object.values(any.AdminUsers.entities));
    if (Array.isArray(any?.AdminUsers?.users)) arr.push(...any.AdminUsers.users);
    if (Array.isArray(any?.AdminUsers?.list)) arr.push(...any.AdminUsers.list);
    return arr;
  });

  const usersById = useMemo(() => {
    const m = new Map<string, any>();
    (Array.isArray(usersList) ? usersList : []).forEach((u: any) => {
      const key = String(u?.id ?? u?.userId ?? u?.user_id ?? "").trim();
      if (key) m.set(key, u);
    });
    return m;
  }, [usersList]);

  // טעינה ראשונית
  useEffect(() => {
    if (donationsStatus === "idle") {
      dispatch(getAllDonations({} as any));
      dispatch(getFundsOverview()); // לא חובה, אבל לא מזיק
    }
  }, [dispatch, donationsStatus]);

  // אחרי שסוגרים מודאל הוספה – ריענון רשימות וחזרה ל-split
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

  // דאטה בסיסית
  const donations = Array.isArray(allDonations) ? allDonations : [];
  const selectedUserId = selectedUser?.id != null ? String(selectedUser.id) : null;

  // תרומות בסיס בהתאם למשתמש נבחר (אם יש)
  const donationsBase = useMemo(() => {
    if (!selectedUserId) return donations;
    return donations.filter((d: any) => getDonorId(d) === selectedUserId);
  }, [donations, selectedUserId]);

  // מצבי UI
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // פריסה
  // const leftCols  = view === "left"  ? 12 : view === "split" ? 6 : 0;
  // const rightCols = view === "right" ? 12 : view === "split" ? 6 : 0;

  // אופציות שנה/חודש
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

      if (activeKey) {
        const cat = getDonationCategory(d);
        if (activeKey === "__regular__" && cat.kind !== "regular") return;
        if (activeKey !== "__regular__" && (cat.kind !== "fund" || cat.key !== activeKey)) return;
      }
      set.add(dt.getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [donationsBase, yearFilter, activeKey]);

  useEffect(() => {
    if (monthFilter !== "all" && !monthOptions.includes(monthFilter)) {
      setMonthFilter("all");
    }
  }, [monthOptions, monthFilter]);

  // סינון
  const filtered = useMemo(() => {
    return donationsBase.filter((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt) return false;
      const okYear  = yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth = monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;

      if (!activeKey) return true;
      const cat = getDonationCategory(d);
      if (activeKey === "__regular__") return cat.kind === "regular";
      if (cat.kind === "fund") return cat.key === activeKey;
      return false;
    });
  }, [donationsBase, yearFilter, monthFilter, activeKey]);

  // מיון
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

  // טבלת שורות – עם שם מלא אמיתי
  const rows: DonationRow[] = useMemo(() => {
    return sorted.map((d: any) => {
      const dt = parseDate(d?.date);
      const userName = getDonorFullName(d, selectedUser, usersById);
      return {
        id: d?.id ?? "—",
        userName, // ← שם מלא; אם user=3 נקבל מה־store או selectedUser
        amount: Number(d?.amount) || 0,
        date: formatDate(dt),
        action: d?.action ?? "—",
        donation_reason: d?.donation_reason ?? "—",
      };
    });
  }, [sorted, selectedUser, usersById]);

  // KPI
  const isLoading = donationsStatus === "pending";
  const isError   = donationsStatus === "rejected";
  const kpiTotal  = useMemo(() => rows.reduce((s, r) => s + (r.amount || 0), 0), [rows]);
  const kpiCount  = rows.length;

  // קרנות – מחושב מקומית; אם יש selectedUser – לפי התרומות שלו
  const overviewAll   = useMemo(() => computeOverviewFromDonations(donations),     [donations]);
  const overviewUser  = useMemo(() => computeOverviewFromDonations(donationsBase), [donationsBase]);
  const rightPanelRegularTotal = selectedUserId ? overviewUser.regularTotal : overviewAll.regularTotal;
  const rightPanelFundCards    = selectedUserId ? overviewUser.fundCards    : overviewAll.fundCards;

  // מיון
  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("desc"); }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
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

          {/* ימין – קרנות */}
          <Grid item xs={12} md={view === "right" ? 12 : view === "split" ? 6 : 0} sx={{ display: view === "left" ? "none" : "block" }}>
            <Frame
              title={selectedUserId ? "קרנות (למשתמש הנבחר)" : "קרנות מיוחדות"}
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
