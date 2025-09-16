import { Box, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import React from 'react'
interface FiltersBarProps {
      yearFilter: number | "all";
  monthFilter: number | "all";  // 0..11 או "all"
  yearOptions: number[];
  monthOptions: number[];
  monthsLabels: string[];
  onChangeYear: (v: number | "all") => void;
  onChangeMonth: (v: number | "all") => void;
}
const FiltersBar: React.FC<FiltersBarProps> = ({yearFilter, monthFilter, yearOptions, monthOptions, monthsLabels, onChangeYear, onChangeMonth}) => {
  return (
<Box sx={{ mb: 3 }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="year-filter-label">שנה</InputLabel>
            <Select
              labelId="year-filter-label"
              label="שנה"
              value={yearFilter === "all" ? "all" : String(yearFilter)}
              onChange={(e) => {
                const v = e.target.value;
                onChangeYear(v === "all" ? "all" : Number(v));
              }}
            >
              <MenuItem value="all">כל השנים</MenuItem>
              {yearOptions.map((y) => (
                <MenuItem key={y} value={String(y)}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="month-filter-label">חודש</InputLabel>
            <Select
              labelId="month-filter-label"
              label="חודש"
              value={monthFilter === "all" ? "all" : String(monthFilter)}
              onChange={(e) => {
                const v = e.target.value;
                onChangeMonth(v === "all" ? "all" : Number(v));
              }}
            >
              <MenuItem value="all">כל החודשים</MenuItem>
              {monthOptions.map((m) => (
                <MenuItem key={m} value={String(m)}>
                  {monthsLabels[m]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>  )
}

export default FiltersBar