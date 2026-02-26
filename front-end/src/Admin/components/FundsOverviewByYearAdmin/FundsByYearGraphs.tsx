import { useEffect, useMemo, useState } from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "./items";
import FundsFieldSelect from "./FundsFieldSelect";
import FundsYearSelect from "./FundsYearSelect";
import FundsTabs from "./FundsTabs";
import FundsGraphs from "./FundsGraphs";
import { AppDispatch, RootState } from "../../../store/store";
import { getFundsOverviewByYear } from "../../../store/features/admin/adminFundsOverviewSlice";
import * as XLSX from "xlsx";
import FundsTable from "./Graphs/FundsTable";
import LoadingIndicator from "../StatusComponents/LoadingIndicator";
import { getUserFundsOverview } from "../../../store/features/user/userFundsOverviewSlice";

const KEY_MAP: Record<string, string | null> = {
  total_special_fund_donations: "special_fund_donations",
  total_loans_taken: "total_loans_taken_count",
  total_fixed_deposits_deposited: "total_fixed_deposits_added",
  total_cash_holdings: null, 
};

const FundsByYearGraphs = () => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);

  const { fundsOverview } = useSelector(
    (state: RootState) => state.UserFundsOverviewSlice
  );
  const { fundsOverviewByYear } = useSelector(
    (state: RootState) => state.AdminFundsOverviewReducer
  );

  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);

  const items = useMemo(
    () => (isAdmin && authUser?.permission != "user" && !selectedUser ? AdminYearlyFinancialItems : UserAdminFinancialItems),
    [isAdmin, selectedUser]
  );

  const DEFAULT_FIELDS = useMemo(() => items.slice(0, 3).map((f) => f.key), [items]);
  const colorByKey = useMemo(
    () => Object.fromEntries(items.map((i) => [i.key, i.color])),
    [items]
  );
  const labelByKey = useMemo(
    () => Object.fromEntries(items.map((i) => [i.key, i.label])),
    [items]
  );

  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // מביא נתונים לפי מצב
  useEffect(() => {
    if (!isAdmin && authUser?.user?.id) {
      dispatch(getUserFundsOverview(authUser.user.id));
    } else if (isAdmin && !selectedUser) {
      dispatch(getFundsOverviewByYear());
    } else if (isAdmin && selectedUser) {
      dispatch(getUserFundsOverview(selectedUser.id));
    }
  }, [dispatch, isAdmin, selectedUser, authUser?.user?.id]);

  const yearlyData = useMemo(() => {
    if (isAdmin) {
      if (!selectedUser) {
        return Array.isArray(fundsOverviewByYear) ? fundsOverviewByYear : [];
      }
      return Array.isArray(fundsOverview) ? fundsOverview : [];
    }
    return Array.isArray(fundsOverview) ? fundsOverview : [];
  }, [isAdmin, selectedUser, fundsOverview, fundsOverviewByYear]);

  // שנים ברירת מחדל
  useEffect(() => {
    if (yearlyData.length > 0) {
      setSelectedYears(yearlyData.map((y) => y.year));
    }
  }, [yearlyData]);

  // ✅ חשוב: כשעוברים מצב (אדמין/יוזר נבחר וכו') – לנרמל selectedFields כדי שלא יישארו keys לא חוקיים
  useEffect(() => {
    const allowed = new Set(items.map((i) => i.key));

    setSelectedFields((prev) => {
      const normalized = prev
        .map((k) => (KEY_MAP[k] === undefined ? k : KEY_MAP[k])) // להמיר אם יש mapping
        .filter((k): k is string => Boolean(k) && allowed.has(k!)); // להסיר null/לא קיים

      return normalized.length ? normalized : DEFAULT_FIELDS;
    });
  }, [items, DEFAULT_FIELDS]);

  const filteredData = useMemo(
    () => yearlyData.filter((y) => selectedYears.includes(y.year)),
    [yearlyData, selectedYears]
  );

  const pieData = useMemo(() => {
    return selectedFields.map((key) => {
      const total = filteredData.reduce(
        (sum, year) => sum + (Number((year as Record<string, any>)[key]) || 0),
        0
      );

      return {
        name: labelByKey[key] ?? key,
        value: total,
        color: colorByKey[key] ?? "#8884d8",
      };
    });
  }, [selectedFields, filteredData, labelByKey, colorByKey]);

  const exportToExcel = () => {
    const dataToExport = filteredData.map((row) => {
      const obj: Record<string, any> = {};
      obj["שנה"] = row.year;

      selectedFields.forEach((key) => {
        const label = labelByKey[key] ?? key;
        obj[label] = (row as Record<string, any>)[key];
      });

      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "נתונים");
    XLSX.writeFile(wb, "export.xlsx");
  };

  const handleFieldChange = (arr: string[]) => setSelectedFields(arr);

  if (yearlyData.length === 0) return <LoadingIndicator />;

  return (
    <Paper sx={{ mt: 5, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          maxHeight: "30%",
          mx: "auto",
          mb: 2,
        }}
      >
        <Button
          variant="text"
          sx={{
            borderRadius: 2,
            fontWeight: "bold",
            gap: 1,
            minWidth: 0,
            p: 0,
            left: 0,
          }}
          onClick={exportToExcel}
          startIcon={
            <img
              src="/xlsx logo.png"
              alt="Excel"
              style={{ width: 32, height: 32 }}
            />
          }
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            p: 2,
            boxShadow: 1,
            minWidth: 240,
            maxWidth: 700,
            mx: "auto",
            maxHeight: "70%",
            overflowY: "auto",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", justifyContent: "center" }}
          >
            גרפים כספיים וטבלה מפורטת לפי בחירה
          </Typography>

          <Box
            sx={{
              mb: 2,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FundsFieldSelect selectedFields={selectedFields} onChange={handleFieldChange} />

            <FundsYearSelect
              years={yearlyData.map((y) => y.year)}
              selectedYears={selectedYears}
              onChange={setSelectedYears}
            />
          </Box>

          <FundsTabs value={selectedTab} onChange={setSelectedTab} />
        </Box>
      </Box>

      {selectedTab < 5 ? (
        <FundsGraphs type={selectedTab} data={filteredData} selectedFields={selectedFields} pieData={pieData} />
      ) : (
        <FundsTable data={filteredData} selectedFields={selectedFields} />
      )}
    </Paper>
  );
};

export default FundsByYearGraphs;
