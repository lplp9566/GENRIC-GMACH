// src/components/SelectUsers/SelectAllUsers.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getAllUsers } from "../../store/features/admin/adminUsersSlice";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

interface Props {
  onChange: (userId: number) => void;
  label?: string;
  // מגדירים כאן גם אפשרות להעביר ערך נבחר
  value?: number;
}

const SelectAllUsers: React.FC<Props> = ({
  onChange,
  label = "בחר משתמש",
  value,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers = useSelector(
    (state: RootState) => state.adminUsers.allUsers
  );

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="select-user-label">{label}</InputLabel>
      <Select
        labelId="select-user-label"
        label={label}
        // אם קיבלנו value, נהפוך אותו למחרוזת, אחרת נעביר מחרוזת ריקה
        value={value != null ? value.toString() : ""}
        onChange={handleChange}
        sx={{ height: 55, minHeight: 55 }}
        inputProps={{ sx: { borderRadius: 2 } }}
        renderValue={(selected) => {
          if (!selected) {
            return <em>{label}</em>;
          }
          const user = allUsers.find((u) => u.id === Number(selected));
          return user
            ? `${user.first_name} ${user.last_name}`
            : <em>משתמש לא נמצא</em>;
        }}
      >
        {allUsers.map((user) => (
          // כאן חשוב שה-value של כל MenuItem יתאים ל-type של value ומחרוזת
          <MenuItem key={user.id} value={user.id.toString()}>
            {user.first_name} {user.last_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectAllUsers;
