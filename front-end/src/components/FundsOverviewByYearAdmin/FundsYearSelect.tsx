import { FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, useMediaQuery } from "@mui/material";
interface Props {
  years: number[];
  selectedYears: number[];
  onChange: (years: number[]) => void;
}
const  FundsYearSelect =({ years, selectedYears, onChange }: Props)=> {
  const isMobile = useMediaQuery("(max-width:600px)");
  const handleChange = (event: any) => {
    const { value } = event.target;
    onChange(typeof value === "string" ? value.split(",") : value);
  };
  return (
<FormControl sx={{ minWidth: isMobile ? 110 : 170 }}>
      <Select
        multiple
        size="small"
        value={selectedYears}
        onChange={handleChange}
        input={<OutlinedInput label="בחירת שנים" />}
        renderValue={()=>"בחירת שנים"}
        MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            <Checkbox checked={selectedYears.includes(year)} />
            <ListItemText primary={year} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
export default FundsYearSelect
