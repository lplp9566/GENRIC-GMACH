import  { useState, useEffect } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { allFields } from "./fields";
import FundsFieldSelect from "./FundsFieldSelect";
import FundsYearSelect from "./FundsYearSelect";
import FundsTabs from "./FundsTabs";
import FundsGraphs from "./FundsGraphs";
import FundsTable from "./FundsTable";
import { AppDispatch, RootState } from "../../store/store";
import { getFundsOverviewByYear } from "../../store/features/admin/adminFundsOverviewSlice";

const MAX_FIELDS = 15;
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
  const [fieldsWarning, setFieldsWarning] = useState(false);

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
  const lastYear = filteredData[filteredData.length - 1] || {};
  const pieData = selectedFields.map((key, idx) => ({
    name: allFields.find((f) => f.key === key)?.label ?? key,
    value: (lastYear as Record<string, any>)[key] ?? 0,
    color: COLORS[idx % COLORS.length],
  }));

  // Field select handler
  const handleFieldChange = (arr: string[]) => {
    if (arr.length > MAX_FIELDS) {
      setFieldsWarning(true);
      return;
    }
    setFieldsWarning(false);
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
          justifyContent: "center",
          flexWrap: "wrap",
          flexDirection: "column",
        }}
      >
        <div
          style={{
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
            maxFields={MAX_FIELDS}
            warning={fieldsWarning}
          />
          <FundsYearSelect
            years={yearlyData.map((y) => y.year)}
            selectedYears={selectedYears}
            onChange={setSelectedYears}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FundsTabs value={selectedTab} onChange={setSelectedTab} />
        </div>
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
