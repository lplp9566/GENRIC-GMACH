import { useState, useEffect } from "react";
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

  const DEFAULT_FIELDS =
    isAdmin && !selectedUser
      ? AdminYearlyFinancialItems.slice(0, 3).map((f) => f.key)
      : UserAdminFinancialItems.slice(0, 3).map((f) => f.key);
  const COLORS =
    isAdmin && !selectedUser
      ? AdminYearlyFinancialItems.map((f) => f.color)
      : UserAdminFinancialItems.map((f) => f.color);
  const [selectedFields, setSelectedFields] =
    useState<string[]>(DEFAULT_FIELDS);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  useEffect(() => {
    if (!isAdmin && authUser?.user?.id) {
      dispatch(getUserFundsOverview(authUser.user.id));
    } else if (isAdmin && !selectedUser) {
      dispatch(getFundsOverviewByYear());
    } else if (isAdmin && selectedUser) {
      dispatch(getUserFundsOverview(selectedUser.id));
    }
  }, [dispatch, isAdmin, selectedUser, authUser?.user?.id]);
  const yearlyData = isAdmin
    ? !selectedUser
      ? Array.isArray(fundsOverviewByYear)
        ? fundsOverviewByYear
        : []
      : Array.isArray(fundsOverview)
      ? fundsOverview
      : []
    : Array.isArray(fundsOverview)
    ? fundsOverview
    : [];

  useEffect(() => {
    if (yearlyData.length > 0) {
      setSelectedYears(yearlyData.map((y) => y.year));
    }
  }, [yearlyData]);

  // Pie Data
  const filteredData = yearlyData.filter((y) => selectedYears.includes(y.year));
  const pieData = selectedFields.map((key, idx) => {

    const total = filteredData.reduce(
      (sum, year) => sum + (Number((year as Record<string, any>)[key]) || 0),
      0
    );
    return {
      name:
        isAdmin && !selectedUser
          ? AdminYearlyFinancialItems.find((f) => f.key === key)?.label ?? key
          : UserAdminFinancialItems.find((f) => f.key === key)?.label ?? key,
      value: total,
      color: COLORS[idx % COLORS.length],
    };
  });

  // ==== כאן ייצוא עם כותרות בעברית ורק מה שנבחר ====
  const exportToExcel = () => {
    const dataToExport = filteredData.map((row) => {
      const obj: Record<string, any> = {};
      // הוספת עמודה של שנה
      obj["שנה"] = row.year;
      selectedFields.forEach((key) => {
        const label =
          isAdmin && !selectedUser
            ? AdminYearlyFinancialItems.find((f) => f.key === key)?.label ?? key
            : UserAdminFinancialItems.find((f) => f.key === key)?.label ?? key;
        obj[label] = (row as Record<string, any>)[key];
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "נתונים");
    XLSX.writeFile(wb, "export.xlsx");
  };
  const handleFieldChange = (arr: string[]) => {
    setSelectedFields(arr);
  };

  if (yearlyData.length === 0) {
    return <LoadingIndicator />;
  }

  return (
    <Paper
      sx={{
        mt: 5,
        p: 3,
      }}
    >
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
        ></Button>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // background: "rgba(255, 230, 240, 0.11)",
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
            <FundsFieldSelect
              selectedFields={selectedFields}
              onChange={handleFieldChange}
            />
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
        <FundsGraphs
          type={selectedTab}
          data={filteredData}
          selectedFields={selectedFields}
          pieData={pieData}
        />
      ) : (
        <FundsTable data={filteredData} selectedFields={selectedFields} />
      )}
    </Paper>
  );
};
export default FundsByYearGraphs;
