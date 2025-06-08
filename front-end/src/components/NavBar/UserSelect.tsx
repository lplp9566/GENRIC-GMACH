import React from "react";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { setSelectedUser } from "../../store/features/admin/adminUsersSlice";

export const UserSelect: React.FC<{ fullWidth?: boolean }> = ({ fullWidth }) => {
  const dispatch = useDispatch<AppDispatch>();
  const allUsers     = useSelector((s: RootState) => s.adminUsers.allUsers);
  const selectedUser = useSelector((s: RootState) => s.adminUsers.selectedUser);

  return (
    <Autocomplete
      options={allUsers}
      value={selectedUser}
      onChange={(_, v) => dispatch(setSelectedUser(v ?? null))}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      getOptionLabel={(o) => `${o.first_name} ${o.last_name}`}
      size="small"
      sx={{
        width: fullWidth ? "100%" : 200,
        backgroundColor: "#FFF",
        borderRadius: 1,
        "& .MuiOutlinedInput-root": { pr: 0 },
        "& .MuiAutocomplete-input": { p: "6px 8px" },
        my: fullWidth ? 1 : 0,
      }}
      popupIcon={<PersonIcon color="action" />}
      renderInput={(p) => (
        <TextField
          {...p}
          placeholder="כל המשתמשים"
          InputProps={{
            ...p.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "#003366" }} />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};
