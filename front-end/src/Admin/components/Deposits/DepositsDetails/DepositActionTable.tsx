import React, { FC, useMemo, useState } from "react";
import { Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { DepositActionsType, IDepositAction } from "../depositsDto";

type SortField = "date" | "action_type" | "result";
type SortDirection = "asc" | "desc";

interface DepositActionTableProps {
  actions: IDepositAction[];
}

const ACTION_LABELS: Record<DepositActionsType, string> = {
  [DepositActionsType.AddToDeposit]: "הפקדה",
  [DepositActionsType.RemoveFromDeposit]: "משיכה",
  [DepositActionsType.ChangeReturnDate]: "שינוי תאריך סיום",
};

const ACTION_ORDER: DepositActionsType[] = [
  DepositActionsType.AddToDeposit,
  DepositActionsType.RemoveFromDeposit,
  DepositActionsType.ChangeReturnDate,
];

const DepositActionTable: FC<DepositActionTableProps> = ({ actions }) => {
  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>("asc");

  const handleHeaderClick = (field: SortField) => {
    if (field === currentSortField) {
      setCurrentSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setCurrentSortField(field);
      setCurrentSortDirection("asc");
    }
  };

  const sortedActions = useMemo(() => {
    const dir = currentSortDirection === "asc" ? 1 : -1;
    const orderMap = new Map(ACTION_ORDER.map((t, i) => [t, i]));
    const copy = [...actions];

    copy.sort((a, b) => {
      const typeA = (a as any).action_type ?? (a as any).actionType;
      const typeB = (b as any).action_type ?? (b as any).actionType;

      let cmp = 0;
      if (currentSortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (currentSortField === "action_type") {
        cmp = (orderMap.get(typeA) ?? 0) - (orderMap.get(typeB) ?? 0);
      } else {
        cmp = (a.amount ?? 0) - (b.amount ?? 0);
      }
      return cmp * dir;
    });

    return copy;
  }, [actions, currentSortField, currentSortDirection]);

  const renderSortIndicator = (field: SortField) =>
    currentSortField === field ? (currentSortDirection === "asc" ? " ▲" : " ▼") : "";

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: "100%" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}>
        פעולות על הפקדה
      </Typography>

      {actions.length === 0 ? (
        <Typography>לא נמצאו פעולות</Typography>
      ) : (
        <Table size="small" sx={{ borderSpacing: "0 6px" }}>
          <TableHead>
            <TableRow sx={{ "& th": { background: "#E9F0F7", fontWeight: 700, cursor: "pointer" } }}>
              <TableCell align="right" onClick={() => handleHeaderClick("date")}>
                תאריך{renderSortIndicator("date")}
              </TableCell>
              <TableCell align="center" onClick={() => handleHeaderClick("action_type")}>
                סוג פעולה{renderSortIndicator("action_type")}
              </TableCell>
              <TableCell align="left" onClick={() => handleHeaderClick("result")}>
                פעולה{renderSortIndicator("result")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedActions.map((action) => {
              const type = (action as any).action_type ?? (action as any).actionType;
              const label = ACTION_LABELS[type as DepositActionsType] ?? String(type);

              return (
                <TableRow key={action.id} hover sx={{ "& td": { border: "none" } }}>
                  <TableCell align="right">
                    {new Date(action.date).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={label}
                      size="small"
                      color={
                        type === DepositActionsType.AddToDeposit
                          ? "success"
                          : type === DepositActionsType.RemoveFromDeposit
                          ? "warning"
                          : type === DepositActionsType.ChangeReturnDate
                          ? "info"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 600, color: "#007BFF" }}>
                    {type === DepositActionsType.ChangeReturnDate
                      && action.update_date
                      ? `${new Date(action.update_date).toLocaleDateString("he-IL")}`
                      : null
                    }
                    {type !== DepositActionsType.ChangeReturnDate && "₪"}
                    {action.amount}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default DepositActionTable;
