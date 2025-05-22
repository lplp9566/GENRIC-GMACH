import React, { useEffect } from 'react';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../../store/features/admin/adminUsersSlice';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

interface Props {
  value?: string;
  onChange: (userId: string) => void;
  label?: string;
}

const SelectAllUsers: React.FC<Props> = ({ value = '', onChange, label = "בחר משתמש" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { allUsers } = useSelector((state: RootState) => state.adminUsers);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="select-user-label">{label}</InputLabel>
      <Select
        labelId="select-user-label"
        value={value}
        label={label}
        onChange={handleChange}
      >
        {allUsers?.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.first_name} {user.last_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectAllUsers;
