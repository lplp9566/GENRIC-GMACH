import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import {  ActionTypes, ILoanAction } from "../LoanDto";

interface Props {
  actions: ILoanAction[];
}

const ActionsTable: React.FC<Props> = ({ actions }) => (

  <Paper
    elevation={3}
    sx={{
      p: 3,
      borderRadius: 2,
      width: "100%", 
      // maxWidth: 400,         
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
      פעולות על הלוואה
    </Typography>
  {!actions.length && <Typography>לא נמצאו פעולות</Typography>}
    <Table
      size="small"
      sx={{
        minWidth: 0,          // ⬅️ בטל ניפוח מיותר
        borderSpacing: "0 6px",
      }}
    >
      <TableHead>
        <TableRow sx={{ "& th": { background: "#E9F0F7", fontWeight: 700 } }}>
          <TableCell align="right">תאריך</TableCell>
          <TableCell align="center">סוג פעולה</TableCell>
          <TableCell align="left">ערך</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {actions.length ? (
          actions.map((a) => (
            <TableRow key={a.id} hover sx={{ "& td": { border: "none" } }}>
              <TableCell align="right">
                {new Date(a.date).toLocaleDateString("he-IL")}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={
                    ActionTypes.find((x) => x.value === a.action_type)?.label
                  }
                  size="small"
                  color={a.action_type === "PAYMENT" ? "success" : "info"}
                />
              </TableCell>
              <TableCell align="left" sx={{ fontWeight: 600, color: "#007BFF" }}>
                ₪{a.value.toLocaleString()}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} align="center">
              אין פעולות להלוואה זו.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
);

export default ActionsTable;