import { FC, useEffect, useMemo, useState } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";

import Frame from "../components/Donations/Frame";
import FiltersBar from "../components/Donations/FiltersBar";
import ExpensesTable, {
  ExpenseRow,
  SortBy,
  SortDir,
} from "../components/Expenses/ExpensesTable";
import KpiRowExpenses from "../components/Expenses/KpiRowExpenses";
import CategoriesPanel, {
  CategoryCardData,
} from "../components/Expenses/CategoriesPanel";
import {
  getAllExpenses,
  getAllExpensesCategory,
} from "../../store/features/admin/adminExpensesSlice";
import ExpensesHeader from "../components/Expenses/ExpensesHeader";
import AddExpenseModal, {
  AddExpenseDraft,
} from "../components/Expenses/AddExpenseModal";
import { MONTHS, ViewMode } from "../Types";
import { ddmmyyyyToInputDate, formatDate, normalizeKey, parseDate } from "../Hooks/genricFunction";


function getExpenseCategory(exp: any): { key: string; label: string } {
  const name = exp?.category?.name ?? "ללא קטגוריה";
  const id = exp?.category?.id;
  const key = id != null ? `cat-${id}` : `cat-${normalizeKey(name)}`;
  return { key, label: String(name) };
}

function toCategoryCards(categories: any[], expenses: any[]): CategoryCardData[] {
  const totals = new Map<string, { label: string; total: number }>();

  (Array.isArray(categories) ? categories : []).forEach((c: any) => {
    const key = c?.id != null ? `cat-${c.id}` : `cat-${normalizeKey(c?.name)}`;
    const label = String(c?.name ?? "");
    if (!label) return;
    totals.set(key, { label, total: 0 });
  });

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


const ExpensesHomePage: FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [addExpenseDraft, setAddExpenseDraft] = useState<AddExpenseDraft | null>(
    null
  );

  const {
    allExpenses,
    allExpensesCategory,
    getAllExpensesStatus: expensesStatus,
    error,
  } = useSelector((s: RootState) => s.AdminExpensesSlice);

  // טעינה ראשונית
  useEffect(() => {
    if (expensesStatus === "idle") {
      dispatch(getAllExpenses({} as any));
    }
    dispatch(getAllExpensesCategory());
  }, [dispatch, expensesStatus]);

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
  const [activeKey, setActiveKey] = useState<string | null>(null);

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

  const baseFiltered = useMemo(() => {
    return expenses.filter((e: any) => {
      const dt = parseDate(e?.expenseDate);
      if (!dt) return false;

      const okYear = yearFilter === "all" ? true : dt.getFullYear() === yearFilter;
      const okMonth = monthFilter === "all" ? true : dt.getMonth() === monthFilter;
      if (!okYear || !okMonth) return false;

      if (!activeKey) return true;
      const cat = getExpenseCategory(e);
      return cat.key === activeKey;
    });
  }, [expenses, yearFilter, monthFilter, activeKey]);

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

  // ✅ כאן התיקון: מוסיפים categoryId לשורה
  const rows: ExpenseRow[] = useMemo(() => {
    return sorted.map((e: any) => {
      const dt = parseDate(e?.expenseDate);
      const cat = getExpenseCategory(e);
      return {
        id: e?.id ?? "—",
        amount: Number(e?.amount) || 0,
        date: formatDate(dt),
        category: cat.label,
        categoryId: e?.category?.id ?? null, // ✅ חובה לשכפול
        note: e?.note ?? "",
      };
    });
  }, [sorted]);

  // KPI
  const totalAmount = useMemo(() => {
    return baseFiltered.reduce((s: number, e: any) => s + (Number(e?.amount) || 0), 0);
  }, [baseFiltered]);

  const actionsCount = useMemo(() => baseFiltered.length, [baseFiltered]);

  const categoriesArr = useMemo(
    () => (Array.isArray(allExpensesCategory) ? allExpensesCategory : []),
    [allExpensesCategory]
  );

  const categoryCards = useMemo(() => toCategoryCards(categoriesArr, expenses), [
    categoriesArr,
    expenses,
  ]);

  const categoriesPanelKey = useMemo(() => {
    return `cats-${expensesSig}-${JSON.stringify(categoriesArr.map((c: any) => c?.id))}`;
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
      maxWidth={false}
      disableGutters
      sx={{
        px: 2,
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <ExpensesHeader />

      {/* ✅ חובה: המודאל בפועל */}
      {canWrite && (
        <AddExpenseModal
          open={openAddExpense}
          draft={addExpenseDraft}
          onClose={() => {
            setOpenAddExpense(false);
            setAddExpenseDraft(null);
          }}
        />
      )}

      <Box mt={6}>
        {isError && (
          <Alert severity="error">{error || "אירעה שגיאה בטעינת הוצאות"}</Alert>
        )}

        <Grid container spacing={1}>
          <Grid
            item
            xs={12}
            md={view === "left" ? 12 : view === "split" ? 7 : 0}
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
                readOnly={!canWrite}
                onSortClick={handleSortClick}
                onDuplicate={(row) => {
                  if (!canWrite) return;
                  setAddExpenseDraft({
                    categoryId: row.categoryId ?? null,
                    amount: row.amount,
                    expenseDate: ddmmyyyyToInputDate(row.date),
                    note: row.note ?? "",
                  });
                  setOpenAddExpense(true);
                }}
              />
            </Frame>
          </Grid>

          <Grid
            item
            xs={12}
            md={view === "right" ? 12 : view === "split" ? 5 : 0}
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
