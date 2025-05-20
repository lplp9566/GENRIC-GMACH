import { useState, useEffect } from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { allFields } from "./fields";
import FundsFieldSelect from "./FundsFieldSelect";
import FundsYearSelect from "./FundsYearSelect";
import FundsTabs from "./FundsTabs";
import FundsGraphs from "./FundsGraphs";
import FundsTable from "./FundsTable";
import { AppDispatch, RootState } from "../../store/store";
import { getFundsOverviewByYear } from "../../store/features/admin/adminFundsOverviewSlice";
import * as XLSX from "xlsx";

const DEFAULT_FIELDS = allFields.slice(0, 3).map((f) => f.key);
const COLORS = allFields.map((f) => f.color);

const FundsByYearGraphs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fundsOverviewByYear } = useSelector(
    (state: RootState) => state.adminFundsOverviewReducer
  );
  const [selectedFields, setSelectedFields] =
    useState<string[]>(DEFAULT_FIELDS);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  useEffect(() => {
    dispatch(getFundsOverviewByYear());
  }, [dispatch]);

  // עיבוד הדאטה - לוקח רק ערכים שהם מספר
  const yearlyData = Array.isArray(fundsOverviewByYear)
    ? fundsOverviewByYear
    : [];
  useEffect(() => {
    if (yearlyData.length > 0) {
      setSelectedYears(yearlyData.map((y) => y.year));
    }
  }, [fundsOverviewByYear]);

  // Pie Data
  const filteredData = yearlyData.filter((y) => selectedYears.includes(y.year));
  const pieData = selectedFields.map((key, idx) => {
    // סוכם את הערך של השדה הזה בכל השנים שבחרו
    const total = filteredData.reduce(
      (sum, year) => sum + (Number((year as Record<string, any>)[key]) || 0),
      0
    );

    return {
      name: allFields.find((f) => f.key === key)?.label ?? key,
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
        const label = allFields.find((f) => f.key === key)?.label ?? key;
        obj[label] = (row as Record<string, any>)[key];
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "נתונים");
    XLSX.writeFile(wb, "export.xlsx");
  };
  // ==== סוף ייצוא ====

  const handleFieldChange = (arr: string[]) => {
    setSelectedFields(arr);
  };

  if (!fundsOverviewByYear || yearlyData.length === 0) {
    return <div>טוען נתונים...</div>;
  }

  return (
<Paper
  sx={{
    mt: 5,
    p: 3,
    borderRadius: 5,
    minHeight: 500,
    background: "linear-gradient(90deg, #f7fafc 80%, #e3f5ff 100%)",
    maxHeight: "90%"
  }}
>
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
    //   justifyContent: "space-between", // או: "center" אם אתה רוצה ריווח קבוע
      width: "100%", 
      maxHeight: "30%",
      mx: "auto",
      mb: 2
    }}
  >
    {/* כפתור אקסל בצד שמאל (RTL) */}
    <Button
      variant="text"
      sx={{
        borderRadius: 2,
        fontWeight: "bold",
        gap: 1,
        minWidth: 0,
        p: 0,
        left: 0,

        "&:hover": { backgroundColor: "#f0f6ff" }
      }}
      onClick={exportToExcel}
      startIcon={
        <img src="/xlsx logo.png" alt="Excel" style={{ width: 32, height: 32 }} />
      }
    >
    </Button>

    {/* קופסת הסלקטים והכותרת */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "rgba(255, 230, 240, 0.11)",
        borderRadius: 3,
        p: 2,
        boxShadow: 1,
        minWidth: 240,
        maxWidth: 700,
        mx: "auto",
        maxHeight: "70%",
        overflowY: "auto"
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
