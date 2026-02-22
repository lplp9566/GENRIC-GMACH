import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getAllDonations,
  getDonationByUserId,
} from "../../store/features/admin/adminDonationsSlice";

import DonationsTable, {
  DonationRow,
  SortBy,
  SortDir,
} from "../components/Donations/DonationsTable";
import FundsPanel, { FundCardData } from "../components/Donations/FundPanel";
import FiltersBar from "../components/Donations/FiltersBar";
import Frame from "../components/Donations/Frame";
import KpiRow from "../components/Donations/KpiRow";
import DonationHeader from "../components/Donations/DonationHeader";
import NewDonation from "../components/Donations/NewDonation";
import WithdrawFundModal from "../components/Donations/WithdrawFond";
import { MONTHS, ViewMode } from "../Types";
import { formatDate, normalizeKey, parseDate } from "../Hooks/genricFunction";

function getDonationCategory(d: any): {
  kind: "regular" | "fund";
  key: string;
  label: string;
} {
  const reasonRaw = String(d?.donation_reason ?? "").trim();
  const rlow = reasonRaw.toLowerCase();
  const isRegular = !reasonRaw || rlow === "equity" || rlow === "equality";
  if (isRegular)
    return { kind: "regular", key: "__regular__", label: "תרומות רגילות" };
  return { kind: "fund", key: normalizeKey(reasonRaw), label: reasonRaw };
}

function computeOverviewForUserNet(donations: any[]): {
  regularTotal: number;
  fundCards: FundCardData[];
} {
  let regular = 0;
  const map = new Map<string, { label: string; total: number }>();

  for (const d of donations) {
    const amt = Number(d?.amount ?? 0) || 0;
    const action = String(d?.action ?? "").toLowerCase();
    const sign = action === "withdraw" ? -1 : 1;
    const cat = getDonationCategory(d);

    if (cat.kind === "regular") {
      regular += sign * amt;
    } else {
      const cur = map.get(cat.key) ?? { label: cat.label, total: 0 };
      cur.total += sign * amt;
      map.set(cat.key, cur);
    }
  }

  const fundCards: FundCardData[] = Array.from(map.entries()).map(
    ([key, v]) => ({
      key,
      label: v.label,
      total: v.total,
    })
  );

  return { regularTotal: regular, fundCards };
}

// -------- Component --------
const DonationsHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const addDonationModal = useSelector(
    (s: RootState) => s.mapModeSlice.AddDonationModal
  );
  const withdrawDonationModal = useSelector(
    (s: RootState) => s.mapModeSlice.withdrawDonationModal
  );

  const {
    allDonations,
    status: donationsStatus,
    error,
  } = useSelector((s: RootState) => s.AdminDonationsSlice);

  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const authUser = useSelector((s: RootState) => s.authslice.user);

  const isAdmin = Boolean(authUser?.is_admin);
  const myUserId = authUser?.user?.id ?? null;

  const donations = Array.isArray(allDonations) ? allDonations : [];
  const donationsBase = donations; // השרת כבר מחזיר מסונן לפי הצורך

  // ---- טעינה ראשונית/שינוי משתמש ----
  useEffect(() => {
    if (donationsStatus !== "idle") return;

    // לא אדמין -> מביאים רק את התרומות של המשתמש המחובר
    if (!isAdmin && authUser?.user.permission === "user") {
      if (myUserId != null) dispatch(getDonationByUserId(Number(myUserId)));
      return;
    }

    // אדמין -> אם נבחר משתמש, מביאים שלו. אם לא נבחר -> מביאים הכל
    if (selectedUser?.id != null) {
      dispatch(getDonationByUserId(Number(selectedUser.id)));
    } else {
      dispatch(getAllDonations({} as any));
    }
  }, [dispatch, donationsStatus, isAdmin, myUserId, selectedUser?.id]);

  // ---- רענון אחרי סגירת מודאל ----
  const wasOpen = useRef(addDonationModal);
  const [view, setView] = useState<ViewMode>("split");

  useEffect(() => {
    if (wasOpen.current && !addDonationModal) {
      // מרעננים את אותה תצורה כמו בטעינה הראשונית
      if (!isAdmin) {
        if (myUserId != null) dispatch(getDonationByUserId(Number(myUserId)));
      } else {
        if (selectedUser?.id != null) {
          dispatch(getDonationByUserId(Number(selectedUser.id)));
        } else {
          dispatch(getAllDonations({} as any));
        }
      }

      setView("split");
    }

    wasOpen.current = addDonationModal;
  }, [addDonationModal, dispatch, isAdmin, myUserId, selectedUser?.id]);

  // ---- מצבי UI ----
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const isFundsView = !!activeKey && activeKey !== "__regular__";

  // ---- אופציות שנה/חודש ----
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
        if (
          activeKey !== "__regular__" &&
          (cat.kind !== "fund" || cat.key !== activeKey)
        )
          return;
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

  // ---- פילטר בסיס ----
  const baseFiltered = useMemo(() => {
    return donationsBase.filter((d: any) => {
      const dt = parseDate(d?.date);
      if (!dt) return false;

      const okYear =
        yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth =
        monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;

      if (!activeKey) return true;

      const cat = getDonationCategory(d);
      if (activeKey === "__regular__") return cat.kind === "regular";
      return cat.kind === "fund" && cat.key === activeKey;
    });
  }, [donationsBase, yearFilter, monthFilter, activeKey]);

  const filteredForTable = useMemo(() => baseFiltered, [baseFiltered]);

  // ---- מיון ----
  const sorted = useMemo(() => {
    const arr = [...filteredForTable];
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
  }, [filteredForTable, sortBy, sortDir]);

  const rows: DonationRow[] = useMemo(() => {
    return sorted.map((d: any) => {
      const dt = parseDate(d?.date);
      return {
        id: d?.id ?? "—",
        userName: `${d.user?.first_name ?? ""} ${d.user?.last_name ?? ""}`.trim(),
        userId: Number(d?.user?.id ?? d?.userId ?? d?.user_id ?? 0),
        amount: Number(d?.amount) || 0,
        date: formatDate(dt),
        updatedAt: formatDate(
          parseDate(d?.updated_at ?? d?.updatedAt ?? null)
        ),
        action: d?.action ?? "—",
        donation_reason: d?.donation_reason ?? "—",
        note: d?.note ?? "",
      };
    });
  }, [sorted]);

  const isLoading = donationsStatus === "pending";
  const isError = donationsStatus === "rejected";

  // ---- KPI ----
  const depositSum = useMemo(() => {
    return baseFiltered.reduce((s: number, d: any) => {
      return (
        s +
        (String(d?.action ?? "").toLowerCase() === "donation"
          ? Number(d?.amount) || 0
          : 0)
      );
    }, 0);
  }, [baseFiltered]);

  const withdrawSum = useMemo(() => {
    return baseFiltered.reduce((s: number, d: any) => {
      return (
        s +
        (String(d?.action ?? "").toLowerCase() === "withdraw"
          ? Number(d?.amount) || 0
          : 0)
      );
    }, 0);
  }, [baseFiltered]);

  const actionsCount = useMemo(() => baseFiltered.length, [baseFiltered]);

  // ---- Right panel (קרנות + רגיל) ----
  const right = useMemo(() => {
    return computeOverviewForUserNet(donationsBase);
  }, [donationsBase]);

  const fundsPanelKey = useMemo(() => {
    // משמש רק כדי “לאפס” מצב פנימי ב-FundsPanel כשמתחלף קונטקסט
    if (!isAdmin) return `me-${myUserId ?? "0"}`;
    if (selectedUser?.id != null) return `user-${selectedUser.id}`;
    return "all";
  }, [isAdmin, myUserId, selectedUser?.id]);

  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  }
useEffect(() => {
  if (!isAdmin) return;

  // אם אדמין בחר משתמש -> להביא רק שלו
  if (selectedUser?.id != null) {
    dispatch(getDonationByUserId(Number(selectedUser.id)));
    return;
  }

  // אם אדמין הוריד בחירה (אין selectedUser) -> להביא הכל
  dispatch(getAllDonations({} as any));
}, [dispatch, isAdmin, selectedUser?.id]);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        px: 2,
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      {addDonationModal && <NewDonation />}
      {withdrawDonationModal && <WithdrawFundModal />}
      <DonationHeader />

      <Box mt={4}>
        {isError && (
          <Alert severity="error">{error || "אירעה שגיאה בטעינת תרומות"}</Alert>
        )}

        <Grid container spacing={1} sx={{ width: "100%" }}>
          {/* שמאל – טבלת תרומות */}
          <Grid
            item
            xs={12}
            md={view === "left" ? 12 : view === "split" ? 9 : 0}
            sx={{ display: view === "right" ? "none" : "block" }}
          >
            <Frame
              title="טבלת תרומות"
              expanded={view === "left"}
              onToggle={() => setView(view === "left" ? "split" : "left")}
            >
              <KpiRow
                view={view}
                totalDonations={actionsCount}
                depositAmount={depositSum}
                withdrawAmount={withdrawSum}
                showWithdrawBox={isFundsView}
              />

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
          <Grid
            item
            xs={12}
            md={view === "right" ? 12 : view === "split" ? 3 : 0}
            sx={{ display: view === "left" ? "none" : "block" }}
          >
            <Frame
              title={"קרנות מיוחדות"}
              expanded={view === "right"}
              onToggle={() => setView(view === "right" ? "split" : "right")}
            >
              <FundsPanel
                key={fundsPanelKey}
                regularTotal={right.regularTotal}
                fundCards={right.fundCards}
                activeKey={activeKey}
                onToggleKey={(k) =>
                  setActiveKey((prev) => (prev === k ? null : k))
                }
              />
            </Frame>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DonationsHomePage;
