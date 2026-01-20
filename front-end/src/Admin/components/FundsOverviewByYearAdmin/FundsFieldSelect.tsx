import { FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, useMediaQuery } from "@mui/material";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "./items";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";


interface Props {
  selectedFields: string[];
  onChange: (value: string[]) => void;
}

const FundsFieldSelect= ({ selectedFields, onChange}: Props)=> {
  const {selectedUser}=useSelector((state: RootState) => state.AdminUsers);
    const isMobile = useMediaQuery("(max-width:600px)");
  const handleChange = (event: any) => {
    const { value } = event.target;
    const arr = typeof value === "string" ? value.split(",") : value;
    onChange(arr);
  };
  console.log(AdminYearlyFinancialItems.map(f => f.key));
  
  return (
  <FormControl sx={{ minWidth: isMobile ? 110 : 170 }}>
      {/* <InputLabel>בחירת קטגוריות</InputLabel> */}
      <Select
        multiple
        size="small"
        value={selectedFields}
        onChange={handleChange}
        input={<OutlinedInput label="בחירת קטגוריות"/>}
        // תמיד מוצג הטקסט הזה, לא משנה מה בחרת
        renderValue={() => "בחירת קטגוריות"}
        MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
      >
        {!selectedUser && AdminYearlyFinancialItems.map((f) => (
          <MenuItem
            key={f.key}
            value={f.key}
            dense
          >
            <Checkbox checked={selectedFields.includes(f.key)} />
            <ListItemText primary={f.label} />
          </MenuItem>
        ))}
        {
          selectedUser && UserAdminFinancialItems.map((f) => (
            <MenuItem
              key={f.key}
              value={f.key}
              dense
            >
              <Checkbox checked={selectedFields.includes(f.key)} />
              <ListItemText primary={f.label} />
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
}
export default FundsFieldSelect
