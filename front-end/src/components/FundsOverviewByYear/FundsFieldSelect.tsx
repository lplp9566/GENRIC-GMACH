import { FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Typography, useMediaQuery } from "@mui/material";
import { allFields } from "./fields";


interface Props {
  selectedFields: string[];
  onChange: (value: string[]) => void;
}

const FundsFieldSelect= ({ selectedFields, onChange}: Props)=> {
    const isMobile = useMediaQuery("(max-width:600px)");
  const handleChange = (event: any) => {
    const { value } = event.target;
    const arr = typeof value === "string" ? value.split(",") : value;
    onChange(arr);
  };
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
        {allFields.map((f) => (
          <MenuItem
            key={f.key}
            value={f.key}
            dense
          >
            <Checkbox checked={selectedFields.includes(f.key)} />
            <ListItemText primary={f.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
export default FundsFieldSelect
