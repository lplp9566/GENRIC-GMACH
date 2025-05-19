import { FormControl, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Typography } from "@mui/material";
import { allFields } from "./fields";

interface Props {
  selectedFields: string[];
  onChange: (value: string[]) => void;
  maxFields?: number;
  warning?: boolean;
}

const FundsFieldSelect= ({ selectedFields, onChange, maxFields = 6, warning }: Props)=> {
  const handleChange = (event: any) => {
    const { value } = event.target;
    const arr = typeof value === "string" ? value.split(",") : value;
    onChange(arr);
  };
  return (
    <FormControl sx={{ minWidth: 170 }}>
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
            disabled={selectedFields.length >= maxFields && !selectedFields.includes(f.key)}
          >
            <Checkbox checked={selectedFields.includes(f.key)} />
            <ListItemText primary={f.label} />
          </MenuItem>
        ))}
      </Select>
      {warning && (
        <Typography color="error" variant="caption">
          ניתן לבחור עד {maxFields} שדות בלבד!
        </Typography>
      )}
    </FormControl>
  );
}
export default FundsFieldSelect
