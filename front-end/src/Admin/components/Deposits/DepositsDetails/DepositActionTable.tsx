import { FC, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DepositActionsType, IDepositAction } from "../depositsDto";

type SortField = "date" | "action_type" | "result";
type SortDirection = "asc" | "desc";

interface DepositActionTableProps {
  actions: IDepositAction[];
  canWrite?: boolean;
  showDepositorName?: boolean;
  onCopy?: (action: IDepositAction) => void;
  onEdit?: (action: IDepositAction) => void;
  onDelete?: (action: IDepositAction) => void;
  hideTitle?: boolean;
}

const ACTION_LABELS: Record<DepositActionsType, string> = {
  [DepositActionsType.InitialDeposit]: "הפקדה ראשונית",
  [DepositActionsType.AddToDeposit]: "הפקדה",
  [DepositActionsType.RemoveFromDeposit]: "משיכה",
  [DepositActionsType.ChangeReturnDate]: "שינוי תאריך סיום",
};

const ACTION_ORDER: DepositActionsType[] = [
  DepositActionsType.InitialDeposit,
  DepositActionsType.AddToDeposit,
  DepositActionsType.RemoveFromDeposit,
  DepositActionsType.ChangeReturnDate,
];

const isMutable = (type: DepositActionsType) =>
  type === DepositActionsType.AddToDeposit || type === DepositActionsType.RemoveFromDeposit;

const DepositActionTable: FC<DepositActionTableProps> = ({
  actions,
  canWrite = false,
  showDepositorName = true,
  onCopy,
  onEdit,
  onDelete,
  hideTitle = false,
}) => {
  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection>("desc");
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");

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
      const typeA = ((a as any).action_type ?? (a as any).actionType) as DepositActionsType;
      const typeB = ((b as any).action_type ?? (b as any).actionType) as DepositActionsType;

      let cmp = 0;
      if (currentSortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (currentSortField === "action_type") {
        cmp = (orderMap.get(typeA) ?? 0) - (orderMap.get(typeB) ?? 0);
      } else {
        cmp = Number(a.amount ?? 0) - Number(b.amount ?? 0);
      }
      return cmp * dir;
    });

    return copy;
  }, [actions, currentSortField, currentSortDirection]);

  const renderSortIndicator = (field: SortField) =>
    currentSortField === field
      ? currentSortDirection === "asc"
        ? " ↑"
        : " ↓"
      : "";

  const handleRowsLimitChange = (event: SelectChangeEvent) => {
    setRowsLimit(event.target.value as "10" | "30" | "all");
  };

  const displayedActions = useMemo(() => {
    if (rowsLimit === "all") return sortedActions;
    return sortedActions.slice(0, Number(rowsLimit));
  }, [rowsLimit, sortedActions]);

  const getDepositOwnerLabel = (action: IDepositAction) => {
    const depositId = action.deposit?.id;
    const first = String(action.deposit?.user?.first_name ?? "").trim();
    const last = String(action.deposit?.user?.last_name ?? "").trim();
    const fullName = `${first} ${last}`.trim();

    if (depositId && fullName && showDepositorName) {
      return `הפקדה #${depositId} - ${fullName}`;
    }
    if (depositId) return `הפקדה #${depositId}`;
    return "-";
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: hideTitle ? "flex-end" : "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        {!hideTitle && (
          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", flex: 1 }}>
            פעולות בהפקדה
          </Typography>
        )}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
          <InputLabel id="deposit-actions-limit-label">תצוגה</InputLabel>
          <Select
            labelId="deposit-actions-limit-label"
            label="תצוגה"
            value={rowsLimit}
            onChange={handleRowsLimitChange}
          >
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="30">30</MenuItem>
            <MenuItem value="all">הכל</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {actions.length === 0 ? (
        <Typography>אין פעולות להצגה</Typography>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small" sx={{ borderSpacing: "0 6px", minWidth: 620 }}>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, cursor: "pointer" } }}>
                <TableCell align="right">{showDepositorName ? "הפקדה / מפקיד" : "הפקדה"}</TableCell>
                <TableCell align="right" onClick={() => handleHeaderClick("date")}>
                  תאריך{renderSortIndicator("date")}
                </TableCell>
                <TableCell align="center" onClick={() => handleHeaderClick("action_type")}>
                  סוג פעולה{renderSortIndicator("action_type")}
                </TableCell>
                <TableCell align="left" onClick={() => handleHeaderClick("result")}>
                  תוצאה{renderSortIndicator("result")}
                </TableCell>
                {canWrite && <TableCell align="center">פעולות</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedActions.map((action) => {
                const type = ((action as any).action_type ?? (action as any).actionType) as DepositActionsType;
                const label = ACTION_LABELS[type] ?? String(type);
                const mutable = isMutable(type);

                return (
                  <TableRow key={action.id} hover sx={{ "& td": { border: "none" } }}>
                    <TableCell align="right">{getDepositOwnerLabel(action)}</TableCell>
                    <TableCell align="right">{new Date(action.date).toLocaleDateString("he-IL")}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={label}
                        size="small"
                        color={
                          type === DepositActionsType.InitialDeposit
                            ? "success"
                            : type === DepositActionsType.AddToDeposit
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
                      {type === DepositActionsType.ChangeReturnDate && action.update_date
                        ? new Date(action.update_date).toLocaleDateString("he-IL")
                        : null}
                      {type !== DepositActionsType.ChangeReturnDate && "₪"}
                      {type !== DepositActionsType.ChangeReturnDate ? Number(action.amount ?? 0) : ""}
                    </TableCell>
                    {canWrite && (
                      <TableCell align="center">
                        <Tooltip title="העתקה">
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                (e.currentTarget as HTMLButtonElement).blur();
                                onCopy?.(action);
                              }}
                              disabled={!mutable}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="עריכה">
                          <span>
                            <IconButton size="small" onClick={() => onEdit?.(action)} disabled={!mutable}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="מחיקה">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete?.(action)}
                              disabled={!mutable}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};

export default DepositActionTable;
