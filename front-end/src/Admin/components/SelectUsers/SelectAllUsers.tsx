import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getAllUsers } from "../../../store/features/admin/adminUsersSlice";
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
  value?: number;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  filter: "all" | "members" | "friends";
}

const SelectAllUsers: React.FC<Props> = ({
  onChange,
  label = "בחר משתמש",
  value,
  color,
  filter,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const allUsers = useSelector(
    (state: RootState) => state.AdminUsers.allUsers
  ) ?? [];

  // מביאים פעם אחת בלבד אם אין עדיין משתמשים
  useEffect(() => {
    if (allUsers.length > 0) return;
    dispatch(getAllUsers({ isAdmin: false }));
  }, [dispatch, allUsers.length]);
  
  const filteredUsers = useMemo(() => {
    if (filter === "members") {
      return allUsers.filter((u) => u.membership_type === "MEMBER");
    }
    if (filter === "friends") {
      return allUsers.filter((u) => u.membership_type === "FRIEND");
    }
    return allUsers;
  }, [allUsers, filter]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(Number(event.target.value));
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="select-user-label" sx={{ color }}>
        {label}
      </InputLabel>

      <Select
        labelId="select-user-label"
        label={label}
        dir="rtl"
        color={color ?? "primary"}
        value={value != null ? value.toString() : ""}
        onChange={handleChange}
        sx={{ height: 55, minHeight: 55 }}
        inputProps={{ sx: { borderRadius: 2 } }}
        renderValue={(selected) => {
          if (!selected) return <em>{label}</em>;
          const user = filteredUsers.find((u) => u.id === Number(selected));
          return user ? `${user.first_name} ${user.last_name}` : <em>משתמש לא נמצא</em>;
        }}
      >
        {filteredUsers.map((user) => (
          <MenuItem key={user.id} value={user.id.toString()} dir="rtl">
            {user.first_name} {user.last_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectAllUsers;
