import { FC, useEffect, useMemo, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

// import {
//   getAllExpenses,
//   getAllExpensesCategories,
// } from "../../store/features/admin/adminExpensesSlice";

import Frame from "../components/Donations/Frame";
import FiltersBar from "../components/Donations/FiltersBar";
import { SortBy, SortDir } from "../components/Donations/DonationsTable";
import ExpensesTable, { ExpenseRow } from "../components/Expenses/ExpensesTable";
import KpiRowExpenses from "../components/Expenses/KpiRowExpenses";
import CategoriesPanel, { CategoryCardData } from "../components/Expenses/CategoriesPanel";
import { getAllExpenses, getAllExpensesCategory } from "../../store/features/admin/adminExpensesSlice";
import ExpensesHeader from "../components/Expenses/ExpensesHeader";



export type ViewMode = "split" | "left" | "right";

export const MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

// -------- Helpers --------
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

function getExpenseCategory(exp: any): { key: string; label: string } {
  // ב-Entity שלך category הוא eager וכולל name + id
  const name = exp?.category?.name ?? "ללא קטגוריה";
  const id = exp?.category?.id;
  // key יציב: אם יש id נשתמש בו; אחרת בשם
  const key = id != null ? `cat-${id}` : `cat-${normalizeKey(name)}`;
  return { key, label: String(name) };
}

function toCategoryCards(categories: any[], expenses: any[]): CategoryCardData[] {
  // מחזיר cards עם total לפי ההוצאות (גם אם קטגוריה ריקה תופיע עם 0)
  const totals = new Map<string, { label: string; total: number }>();

  // קודם נכניס את כל הקטגוריות מהטבלה categories
  (Array.isArray(categories) ? categories : []).forEach((c: any) => {
    const key = c?.id != null ? `cat-${c.id}` : `cat-${normalizeKey(c?.name)}`;
    const label = String(c?.name ?? "");
    if (!label) return;
    totals.set(key, { label, total: 0 });
  });

  // עכשיו נסכם הוצאות בפועל
  (Array.isArray(expenses) ? expenses : []).forEach((e: any) => {
    const amt = Number(e?.amount ?? 0) || 0;
    const cat = getExpenseCategory(e);
    const cur = totals.get(cat.key) ?? { label: cat.label, total: 0 };
    cur.total += amt;
    totals.set(cat.key, cur);
  });

  return Array.from(totals.entries()).map(([key, v]) => ({
    key,
    label: v.label,
    total: v.total,
  }));
}

// -------- Component --------
const ExpensesHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // TODO: אם יש לך מודאלים כמו בהוצאות, תשלוף כמו בתרומות ותעשה רענון לאחר סגירה
  // const addExpenseModal = useSelector((s: RootState) => s.mapModeSlice.AddExpenseModal);

  const {
    allExpenses,
    allExpensesCategory,
    getAllExpensesStatus: expensesStatus,
    error,
  } = useSelector((s: RootState) => s.AdminExpensesSlice); // TODO: שנה לשם האמיתי

  // טעינה ראשונית
  useEffect(() => {
    if (expensesStatus === "idle") {
      dispatch(getAllExpenses({} as any));
    }
    dispatch(getAllExpensesCategory());
  }, [dispatch, expensesStatus]);

  // אם תרצה רענון אחרי סגירת מודאל (כמו בתרומות)
  // const wasOpen = useRef(addExpenseModal);
  // useEffect(() => {
  //   if (wasOpen.current && !addExpenseModal) {
  //     dispatch(getAllExpenses({} as any));
  //     dispatch(getAllExpensesCategories());
  //   }
  //   wasOpen.current = addExpenseModal;
  // }, [addExpenseModal, dispatch]);

  const expenses = Array.isArray(allExpenses) ? allExpenses : [];
  const expensesSig = useMemo(
    () =>
      JSON.stringify(
        expenses.map((e: any) => ({
          id: e?.id,
          amount: e?.amount,
          date: e?.expenseDate,
          categoryId: e?.category?.id,
          categoryName: e?.category?.name,
        }))
      ),
    [expenses]
  );

  // ---- UI state ----
  const [view, setView] = useState<ViewMode>("split");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [activeKey, setActiveKey] = useState<string | null>(null); // קטגוריה נבחרת

  // אופציות שנה/חודש
  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    expenses.forEach((e: any) => {
      const dt = parseDate(e?.expenseDate);
      if (dt) set.add(dt.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [expenses]);

  const monthOptions = useMemo(() => {
    const set = new Set<number>();
    expenses.forEach((e: any) => {
      const dt = parseDate(e?.expenseDate);
      if (!dt) return;
      if (yearFilter !== "all" && dt.getFullYear() !== yearFilter) return;

      if (activeKey) {
        const cat = getExpenseCategory(e);
        if (cat.key !== activeKey) return;
      }

      set.add(dt.getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [expenses, yearFilter, activeKey]);

  useEffect(() => {
    if (monthFilter !== "all" && !monthOptions.includes(monthFilter)) {
      setMonthFilter("all");
    }
  }, [monthOptions, monthFilter]);

  // פילטר בסיס: שנה/חודש + קטגוריה
  const baseFiltered = useMemo(() => {
    return expenses.filter((e: any) => {
      const dt = parseDate(e?.expenseDate);
      if (!dt) return false;

      const okYear =
        yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth =
        monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;

      if (!activeKey) return true;

      const cat = getExpenseCategory(e);
      return cat.key === activeKey;
    });
  }, [expenses, yearFilter, monthFilter, activeKey]);

  // מיון
  const sorted = useMemo(() => {
    const arr = [...baseFiltered];
    arr.sort((a: any, b: any) => {
      if (sortBy === "date") {
        const ta = parseDate(a?.expenseDate)?.getTime() ?? 0;
        const tb = parseDate(b?.expenseDate)?.getTime() ?? 0;
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      const aa = Number(a?.amount) || 0;
      const bb = Number(b?.amount) || 0;
      return sortDir === "asc" ? aa - bb : bb - aa;
    });
    return arr;
  }, [baseFiltered, sortBy, sortDir]);

  const rows: ExpenseRow[] = useMemo(() => {
    return sorted.map((e: any) => {
      const dt = parseDate(e?.expenseDate);
      const cat = getExpenseCategory(e);
      return {
        id: e?.id ?? "—",
        amount: Number(e?.amount) || 0,
        date: formatDate(dt),
        category: cat.label,
        note: e?.note ?? "",
      };
    });
  }, [sorted]);

  // KPI
  const totalAmount = useMemo(() => {
    return baseFiltered.reduce((s: number, e: any) => s + (Number(e?.amount) || 0), 0);
  }, [baseFiltered]);

  const actionsCount = useMemo(() => baseFiltered.length, [baseFiltered]);

  // פאנל קטגוריות (ימין)

const categoriesArr = useMemo(
  () => (Array.isArray(allExpensesCategory) ? allExpensesCategory : []),
  [allExpensesCategory]
);
const categoryCards = useMemo(() => {
  return toCategoryCards(categoriesArr, expenses);
}, [categoriesArr, expenses]);
const categoriesPanelKey = useMemo(() => {
  return `cats-${expensesSig}-${JSON.stringify(
    categoriesArr.map((c: any) => c?.id)
  )}`;
}, [expensesSig, categoriesArr]);


  const isLoading = expensesStatus === "pending";
  const isError = expensesStatus === "rejected";

  function handleSortClick(key: SortBy) {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <ExpensesHeader />

      <Box mt={4}>
        {isError && (
          <Alert severity="error">{error || "אירעה שגיאה בטעינת הוצאות"}</Alert>
        )}

        <Grid container spacing={3}>
          {/* שמאל – טבלת הוצאות */}
          <Grid
            item
            xs={12}
            md={view === "left" ? 12 : view === "split" ? 6 : 0}
            sx={{ display: view === "right" ? "none" : "block" }}
          >
            <Frame
              title="טבלת הוצאות"
              expanded={view === "left"}
              onToggle={() => setView(view === "left" ? "split" : "left")}
            >
              <KpiRowExpenses
                view={view}
                totalExpenses={actionsCount}
                totalAmount={totalAmount}
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

              <ExpensesTable
                isLoading={isLoading}
                rows={rows}
                sortBy={sortBy}
                sortDir={sortDir}
                onSortClick={handleSortClick}
              />
            </Frame>
          </Grid>

          {/* ימין – קטגוריות */}
          <Grid
            item
            xs={12}
            md={view === "right" ? 12 : view === "split" ? 6 : 0}
            sx={{ display: view === "left" ? "none" : "block" }}
          >
            <Frame
              title="קטגוריות הוצאות"
              expanded={view === "right"}
              onToggle={() => setView(view === "right" ? "split" : "right")}
            >
              <CategoriesPanel
                key={categoriesPanelKey}
                categoryCards={categoryCards}
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

export default ExpensesHomePage;
