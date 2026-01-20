import { useMemo } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  useMediaQuery,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "./items";

interface Props {
  selectedFields: string[];
  onChange: (value: string[]) => void;
}

const FundsFieldSelect = ({ selectedFields, onChange }: Props) => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);

  const isMobile = useMediaQuery("(max-width:600px)");

  // כלל אצבע:
  // AdminYearlyFinancialItems רק כשאדמין בלי משתמש נבחר
  // אחרת UserAdminFinancialItems
  const items = useMemo(() => {
    return isAdmin && !selectedUser
      ? AdminYearlyFinancialItems
      : UserAdminFinancialItems;
  }, [isAdmin, selectedUser]);

  const handleChange = (event: any) => {
    const { value } = event.target;
    const arr = typeof value === "string" ? value.split(",") : value;
    onChange(arr);
  };


  console.log("FundsFieldSelect mode:", {
    isAdmin,
    selectedUser: Boolean(selectedUser),
    itemsCount: items.length,
    keys: items.map((f) => f.key),
  });

  return (
    <FormControl sx={{ minWidth: isMobile ? 110 : 170 }}>
      <Select
        multiple
        size="small"
        value={selectedFields}
        onChange={handleChange}
        input={<OutlinedInput label="בחירת קטגוריות" />}
        renderValue={() => "בחירת קטגוריות"}
        MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
      >
        {items.map((f) => (
          <MenuItem key={f.key} value={f.key} dense>
            <Checkbox checked={selectedFields.includes(f.key)} />
            <ListItemText primary={f.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FundsFieldSelect;
