import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
  getAllDonations,
  getAllFunds,
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
function computeRegularTotalFromDonations(donations: any[]): number {
  return (donations ?? []).reduce((sum: number, d: any) => {
    const reason = String(d?.donation_reason ?? "")
      .trim()
      .toLowerCase();
    const isRegular = !reason || reason === "equity" || reason === "equality";
    if (!isRegular) return sum;

    const amt = Number(d?.amount ?? 0) || 0;
    const action = String(d?.action ?? "").toLowerCase();
    const sign = action === "withdraw" ? -1 : 1;
    return sum + sign * amt;
  }, 0);
}

function getDonorId(d: any): string | null {
  const raw =
    (typeof d?.user === "object" && d?.user !== null
      ? d.user.id ?? d.userId ?? d.user_id
      : d?.user) ??
    d?.userId ??
    d?.user_id;
  if (raw == null) return null;
  const key = String(raw).trim();
  return key || null;
}

function toFundCardsFromFunds(funds: any): FundCardData[] {
  if (!Array.isArray(funds)) return [];
  return funds
    .map((f: any) => ({
      key: normalizeKey(f?.name),
      label: String(f?.name ?? ""),
      total: Number(f?.balance ?? 0) || 0,
    }))
    .filter((x: FundCardData) => x.label);
}

// אגרגציה פר־משתמש (נטו)
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
  // const isAdmin = useSelector((s: RootState) => s.authslice.user?.is_admin);

  const {
    allDonations,
    status: donationsStatus,
    error,
  } = useSelector((s: RootState) => s.AdminDonationsSlice);
  const funds = useSelector(
    (s: RootState) => s.AdminDonationsSlice.fundDonation
  );

  const selectedUser = useSelector((s: RootState) => s.AdminUsers.selectedUser);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);
  // טעינה ראשונית
  useEffect(() => {
    if (donationsStatus === "idle") {
      dispatch(getAllDonations({} as any));
    }
    dispatch(getAllFunds());
  }, [dispatch, donationsStatus]);

  // רענון אחרי סגירת מודאל
  const wasOpen = useRef(addDonationModal);
  const [view, setView] = useState<ViewMode>("split");
  useEffect(() => {
    if (wasOpen.current && !addDonationModal) {
      dispatch(getAllDonations({} as any));
      dispatch(getAllFunds());
      setView("split");
    }
    wasOpen.current = addDonationModal;
  }, [addDonationModal, dispatch]);

  // רענון קרנות בכל שינוי תרומות
  const donations = Array.isArray(allDonations) ? allDonations : [];
  const donationsSig = useMemo(
    () =>
      JSON.stringify(
        donations.map((d: any) => ({
          id: d?.id,
          amount: d?.amount,
          action: d?.action,
          date: d?.date,
          reason: d?.donation_reason,
        }))
      ),
    [donations]
  );
  useEffect(() => {
    dispatch(getAllFunds());
  }, [dispatch, donationsSig]);

  const selectedUserId =
    selectedUser?.id != null ? String(selectedUser.id) : null;
  const authUserId =
    authUser?.user?.id != null ? String(authUser.user.id) : null;
  const effectiveUserId = !isAdmin ? authUserId : selectedUserId;

  // תרומות של המשתמש שנבחר (אם בחרו)
  const donationsBase = useMemo(() => {
    if (effectiveUserId) {
      return donations.filter((d: any) => getDonorId(d) === effectiveUserId);
    }
    return donations;
  }, [donations, effectiveUserId]);

  // מצבי UI
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const isFundsView = !!activeKey && activeKey !== "__regular__";

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

  // פילטר “בסיס” (שנה/חודש + קטגוריה)
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

      // activeKey = קרן מסוימת
      return cat.kind === "fund" && cat.key === activeKey;
    });
  }, [donationsBase, yearFilter, monthFilter, activeKey]);

  // ✅ בטבלה מציגים גם הפקדות וגם משיכות (גם בתצוגת קרן)
  const filteredForTable = useMemo(() => {
    return baseFiltered;
  }, [baseFiltered]);

  // מיון לטבלה
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
        userName: `${d.user?.first_name ?? ""} ${
          d.user?.last_name ?? ""
        }`.trim(),
        userId: Number(d?.user?.id ?? d?.userId ?? d?.user_id ?? 0),
        amount: Number(d?.amount) || 0,
        date: formatDate(dt),
        action: d?.action ?? "—",
        donation_reason: d?.donation_reason ?? "—",
        note: d?.note ?? "",
      };
    });
  }, [sorted]);

  const isLoading = donationsStatus === "pending";
  const isError = donationsStatus === "rejected";

  // ✅ KPI: מחשבים מה־baseFiltered (כולל משיכות), כדי שהקוביה של משיכות תראה מספר נכון
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
  // ---------- Right panel ----------
  const right = useMemo(() => {
  if (effectiveUserId) return computeOverviewForUserNet(donationsBase);

    return {
      regularTotal: computeRegularTotalFromDonations(donations), // ✅ פה התיקון
      fundCards: toFundCardsFromFunds(funds),
    };
}, [effectiveUserId, donationsBase, donations, funds]);

  const fundsPanelKey = useMemo(() => {
    return effectiveUserId
      ? `user-${effectiveUserId}-${donationsSig}`
      : `funds-${JSON.stringify(
          (funds ?? []).map((f: any) => ({ id: f?.id, b: f?.balance }))
        )}`;
  }, [effectiveUserId, donationsSig, funds]);

  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

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
              title={ "קרנות מיוחדות"}
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
