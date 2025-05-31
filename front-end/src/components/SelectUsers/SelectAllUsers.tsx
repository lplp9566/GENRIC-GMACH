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
}

const SelectAllUsers: React.FC<Props> = ({ onChange, label = "בחר משתמש" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers = useSelector((state: RootState) => state.adminUsers.allUsers);

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
      sx={{height: '55px', minHeight: '55px'}}
        labelId="select-user-label"
        label={label}
        onChange={handleChange}
        inputProps={{ sx: { borderRadius: 2 } }}
        // displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <em>{label}</em>;
          }
          const user = allUsers.find((u) => u.id === Number(selected));
          return user ? (
            `${user.first_name} ${user.last_name}`
          ) : (
            <em>משתמש לא נמצא</em>
          );
        }}
      >
        {allUsers.map((user) => (
          <MenuItem key={user.id} value={String(user.id)}>
            {user.first_name} {user.last_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectAllUsers;
