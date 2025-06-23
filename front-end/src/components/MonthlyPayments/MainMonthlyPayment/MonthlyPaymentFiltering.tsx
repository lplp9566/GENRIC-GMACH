import { Box, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material'
import { hebrewMonthNames } from '../MunthlyPaymentsDto';
interface MonthlyPaymentFilteringProps {
  selectedYear: number;
    setSelectedYear: (year: number) => void;
    selectedMonth: number;
    setSelectedMonth: (month: number) => void;
    years: number[];
    months?: number[];
}
const MonthlyPaymentFiltering = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  years,
  months

}: MonthlyPaymentFilteringProps) => {
    const getHebrewMonthName = (m: number) => hebrewMonthNames[m - 1] || String(m);
  return (
            <Box mb={2} sx={{ textAlign: "center" }}>
              <Grid container spacing={2} >
                <Grid item xs>
                  <Grid container spacing={2} justifyContent="center"> 
                    <Grid item xs={6} sm="auto">
                      <FormControl fullWidth size="small">
                        <InputLabel id="year-select-label">שנה</InputLabel>
                        <Select
                          labelId="year-select-label"
                          value={selectedYear}
                          label="שנה"
                          onChange={(e) =>
                            setSelectedYear(Number(e.target.value))
                          }
                        >
                          {years.map((y) => (
                            <MenuItem key={y} value={y}>
                              {y}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm="auto">
                      <FormControl fullWidth size="small">
                        <InputLabel id="month-select-label">חודש</InputLabel>
                        <Select
                          labelId="month-select-label"
                          value={selectedMonth}
                          label="חודש"
                          onChange={(e) =>
                            setSelectedMonth(Number(e.target.value))
                          }
                        >
                          <MenuItem value={0}>כל החודשים</MenuItem>
                          {months!.map((m) => (
                            <MenuItem key={m} value={m}>
                              {getHebrewMonthName(m)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
  )
}

export default MonthlyPaymentFiltering