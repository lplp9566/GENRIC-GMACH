// src/pages/DonationsHomePage.tsx
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

// Thunks (אם יש לכם בבאק)
import { getAllDonations } from "../../store/features/admin/adminDonationsSlice";
import { getFundsOverview } from "../../store/features/admin/adminFundsOverviewSlice";

// רכיבים קיימים אצלך
import DonationsTable, { DonationRow, SortBy, SortDir } from "../components/Donations/DonationsTable";
import FundsPanel, { FundCardData } from "../components/Donations/FundPanel";
import FiltersBar from "../components/Donations/FiltersBar";
import Frame from "../components/Donations/Frame";
import KpiRow from "../components/Donations/KpiRow";
import DonationHeader from "../components/Donations/DonationHeader";
import NewDonation from "../components/Donations/NewDonation";

// --- קבועי UI קטנים ---
const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
type ViewMode = "split" | "left" | "right";

// --- פונקציות עזר קטנות, פשוטות ---
function normalizeKey(s: any) { return String(s ?? "").trim().toLowerCase(); }

function parseDate(raw: any): Date | null {
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw));
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date | null) {
  if (!d) return "—";
  // תאריך אחיד וקריא
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

// מחלץ מזהה תורם מתוך תרומה – תומך גם user.id וגם userId/user_id
function getDonorId(d: any): string | null {
  const id = d?.user?.id ?? d?.userId ?? d?.user_id;
  if (id == null) return null;
  const key = String(id).trim();
  return key || null;
}

// מחלץ שם מלא – קודם מהאובייקט עצמו, אח"כ selectedUser, אח"כ מהמפה ב־Redux
function getDonorFullName(d: any, selectedUser: any, usersById: Map<string, any>): string {
  
  // 1) אם יש user עם שם פרטי/משפחה בתוך התרומה
  const first = d?.user?.first_name ?? d?.user?.firstName ?? "";
  const last  = d?.user?.last_name  ?? d?.user?.lastName  ?? "";
  const byNested = `${first} ${last}`.trim();
  if (byNested) return byNested;

  // 2) אם מסונן לפי משתמש וה־id תואם – קח את השם משם
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

  // 4) אם אין – הצג מקף (לא #id)
  return "—";
}

// מחשב קרנות “און דה פליי” מכל התרומות (לא תלוי בשרת)
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

// --- העמוד עצמו: פשוט, פונקציות + return ברור ---
const DonationsHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux
  const addDonationModal = useSelector((s: RootState) => s.mapModeSlice.AddDonationModal);
  const { allDonations, status: donationsStatus, error } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);

  // רשימת משתמשים לבניית מפת id->user (פשוט)
  const usersList = useSelector((s: RootState) =>
    (s as any)?.AdminUsers?.users ?? (s as any)?.AdminUsers?.list ?? []
  );
  const usersById = useMemo(() => {
    const m = new Map<string, any>();
    (Array.isArray(usersList) ? usersList : []).forEach((u: any) => {
      const key = String(u?.id ?? u?.userId ?? u?.user_id ?? "").trim();
      if (key) m.set(key, u);
    });
    return m;
  }, [usersList]);

  // טעינה ראשונית + כשסטטוס חוזר ל-idle
  useEffect(() => {
    if (donationsStatus === "idle") {
      dispatch(getAllDonations({} as any));
      dispatch(getFundsOverview()); // לא מזיק גם אם לא משתמשים
    }
  }, [dispatch, donationsStatus]);

  // אחרי שסוגרים מודאל הוספה – ריענון וחזרה ל-split
  const wasOpen = useRef(addDonationModal);
  useEffect(() => {
    if (wasOpen.current && !addDonationModal) {
      dispatch(getAllDonations({} as any));
      dispatch(getFundsOverview());
      setView("split");
    }
    wasOpen.current = addDonationModal;
  }, [addDonationModal, dispatch]);

  // בסיס נתונים
  const donations = Array.isArray(allDonations) ? allDonations : [];

  // סינון לפי משתמש נבחר (אם יש)
  const selectedUserId = selectedUser?.id != null ? String(selectedUser.id) : null;
  const donationsBase = useMemo(() => {
    if (!selectedUserId) return donations;
    return donations.filter((d: any) => {
      const donorId = getDonorId(d);
      return donorId === selectedUserId;
    });
  }, [donations, selectedUserId]);

  // מצבי UI
  const [view, setView] = useState<ViewMode>("split");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // פריסה
  const leftCols  = view === "left"  ? 12 : view === "split" ? 6 : 0;
  const rightCols = view === "right" ? 12 : view === "split" ? 6 : 0;

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

  // ודא שהחודש חוקי
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

  // שורות לטבלה – פה קורה הקסם של שם מלא
  const rows: DonationRow[] = useMemo(() => {
    return sorted.map((d: any) => {
      const dt = parseDate(d?.date);
      const userName = getDonorFullName(d, selectedUser, usersById);
      return {
        id: d?.id ?? "—",
        userName,                             // ← שם מלא של התורם (אם קיים במפה/selectedUser/האובייקט)
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

  // נתוני קרנות: תמיד מחושב מהתרומות (fresh). אם יש selectedUser – מסכם רק שלו.
  const overviewAll   = useMemo(() => computeOverviewFromDonations(donations),     [donations]);
  const overviewUser  = useMemo(() => computeOverviewFromDonations(donationsBase), [donationsBase]);
  const rightPanelRegularTotal = selectedUserId ? overviewUser.regularTotal : overviewAll.regularTotal;
  const rightPanelFundCards    = selectedUserId ? overviewUser.fundCards    : overviewAll.fundCards;

  // האנדלר של מיון
  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("desc"); }
  }

  // --- וחוזרים לרנדר פשוט ---
  return (
    <Container sx={{ py: 4, direction: "rtl", bgcolor: "#F9FBFC", fontFamily: "Heebo, Arial, sans-serif", minHeight: "100vh" }}>
      {addDonationModal && <NewDonation />}
      <DonationHeader />

      <Box mt={4}>
        {isError && <Alert severity="error">{error || "אירעה שגיאה בטעינת תרומות"}</Alert>}

        <Grid container spacing={3}>
          {/* שמאל – טבלה */}
          <Grid item xs={12} md={leftCols} sx={{ display: leftCols ? "block" : "none" }}>
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
          <Grid item xs={12} md={rightCols} sx={{ display: rightCols ? "block" : "none" }}>
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
