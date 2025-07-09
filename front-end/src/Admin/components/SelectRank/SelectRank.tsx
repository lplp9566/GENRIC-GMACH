// src/components/SelectRank.tsx
import React, { useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { getAllMembershipRanks } from "../../../store/features/admin/adminRankSlice";

interface SelectRankProps {
  value: number;
  onChange: (rankId: number) => void;
  label?: string;
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

const SelectRank: React.FC<SelectRankProps> = ({
  value,
  onChange,
  label = "בחר דרגה",
  color = "primary",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const allRanks = useSelector(
    (state: RootState) => state.AdminRankSlice.memberShipRanks
  );

  useEffect(() => {
    dispatch(getAllMembershipRanks());
  }, [dispatch, allRanks.length]);

  const handleChange = (e: SelectChangeEvent<string>) => {
    const selectedId = Number(e.target.value);
    onChange(selectedId);
  };

  return (
    <FormControl
      fullWidth
      size="small"
      color={color}
    >
      <InputLabel id="select-rank-label">{label}</InputLabel>
      <Select
              dir="rtl"
        labelId="select-rank-label"
        label={label}
        value={value != null ? value.toString() : ""}
        onChange={handleChange}
        sx={{ height: 55, minHeight: 55 }}
        inputProps={{ sx: { borderRadius: 2 } }}
        renderValue={(selected) => {
          if (!selected) {
            return <em>{label}</em>;
          }
          const rank = allRanks.find((r) => r.id === Number(selected));
          return rank ? rank.name : <em>דרגה לא נמצאה</em>;
        }}
      >
        {allRanks.map((r) => (
          <MenuItem key={r.id} value={r.id.toString()} dir="rtl">
            {r.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectRank;
