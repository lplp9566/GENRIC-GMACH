import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Chip,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { ActionTypes, ILoanAction, LoanPaymentActionType } from "../LoanDto";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditLoanActionModal from "./EditLoanActionModal";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../../store/store";
import { useDispatch } from "react-redux";
import { deleteLoanAction } from "../../../../store/features/admin/adminLoanSlice";
import ConfirmModal from "../../genricComponents/confirmModal";

type SortField = "date" | "action_type" | "amount";
type SortDirection = "asc" | "desc";

interface ActionsTableProps {
  actions: ILoanAction[];
  loanId?: number;
  readOnly?: boolean;
  onCopyAction?: (action: ILoanAction) => void;
  showLoanColumn?: boolean;
  title?: string;
  hideTitle?: boolean;
}

export const ActionsTable: React.FC<ActionsTableProps> = ({
  actions,
  loanId,
  readOnly,
  onCopyAction,
  showLoanColumn,
  title,
  hideTitle = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [editModal, setEditModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<ILoanAction | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>("desc");
  const [rowsLimit, setRowsLimit] = useState<"10" | "30" | "all">("10");
  const [actionTypeFilter, setActionTypeFilter] = useState<"all" | LoanPaymentActionType>("all");

  const handleHeaderClick = (field: SortField) => {
    if (field === currentSortField) {
      setCurrentSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setCurrentSortField(field);
      setCurrentSortDirection("asc");
    }
  };

  const ACTION_ORDER: LoanPaymentActionType[] = [
    LoanPaymentActionType.LOAN_CREATED,
    LoanPaymentActionType.PAYMENT,
    LoanPaymentActionType.AMOUNT_CHANGE,
    LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
    LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
  ];

  const deleteAction = () => {
    const targetLoanId = loanId ?? selected?.loan?.id;
    if (!selected || !targetLoanId) return;

    toast.promise(
      dispatch(deleteLoanAction({ id: selected.id, loanId: targetLoanId })),
      {
        pending: "מוחק פעולה...",
        success: "הפעולה נמחקה.",
        error: "Failed to delete action.",
      }
    );

    setDeleteModal(false);
  };

  const sortedActions = useMemo(() => {
    const copy = [...actions];
    copy.sort((a, b) => {
      let cmp = 0;
      if (currentSortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (currentSortField === "amount") {
        cmp = a.value - b.value;
      } else {
        const idxA = ACTION_ORDER.indexOf(a.action_type);
        const idxB = ACTION_ORDER.indexOf(b.action_type);
        cmp = idxA - idxB;
      }
      return currentSortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [actions, currentSortField, currentSortDirection]);

  const renderSortIndicator = (field: SortField) =>
    currentSortField === field
      ? currentSortDirection === "asc"
        ? " ↑"
        : " ↓"
      : "";

  const handleEdit = (action: ILoanAction) => {
    setSelected(action);
    setEditModal(true);
  };

  const handleCopy = (action: ILoanAction) => {
    onCopyAction?.(action);
  };

  const handleRowsLimitChange = (event: SelectChangeEvent) => {
    setRowsLimit(event.target.value as "10" | "30" | "all");
  };

  const handleActionTypeFilterChange = (event: SelectChangeEvent) => {
    setActionTypeFilter(event.target.value as "all" | LoanPaymentActionType);
  };

  const filteredActions = useMemo(() => {
    if (actionTypeFilter === "all") return sortedActions;
    return sortedActions.filter((action) => action.action_type === actionTypeFilter);
  }, [sortedActions, actionTypeFilter]);

  const displayedActions = useMemo(() => {
    if (rowsLimit === "all") return filteredActions;
    return filteredActions.slice(0, Number(rowsLimit));
  }, [rowsLimit, filteredActions]);

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, width: "100%", p: { xs: 1.5, md: 2 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent={hideTitle ? "center" : "space-between"}
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1}
        sx={{ mb: 1 }}
      >
        {!hideTitle && (
          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", flex: 1 }}>
            {title ?? "פעולות על ההלוואה"}
          </Typography>
        )}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mx: hideTitle ? "auto" : 0 }}>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 } }}>
            <InputLabel id="loan-actions-type-filter-label">סוג פעולה</InputLabel>
            <Select
              labelId="loan-actions-type-filter-label"
              label="סוג פעולה"
              value={actionTypeFilter}
              onChange={handleActionTypeFilterChange}
            >
              <MenuItem value="all">כל הסוגים</MenuItem>
              {ActionTypes.map((actionType) => (
                <MenuItem key={actionType.value} value={actionType.value}>
                  {actionType.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 120 } }}>
            <InputLabel id="loan-actions-limit-label">תצוגה</InputLabel>
            <Select
              labelId="loan-actions-limit-label"
              label="תצוגה"
              value={rowsLimit}
              onChange={handleRowsLimitChange}
            >
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="30">30</MenuItem>
              <MenuItem value="all">הכל</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {actions.length === 0 && <Typography>לא נמצאו פעולות</Typography>}

      {actions.length > 0 && (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              borderSpacing: "0 6px",
              width: "100%",
              tableLayout: "fixed",
              minWidth: readOnly ? 0 : 620,
              "& .MuiTableCell-root": {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 700,
                    cursor: "pointer",
                  },
                }}
              >
                {showLoanColumn && <TableCell align="right">הלוואה</TableCell>}
                <TableCell align="right" onClick={() => handleHeaderClick("date")}>
                  תאריך{renderSortIndicator("date")}
                </TableCell>
                <TableCell align="center" onClick={() => handleHeaderClick("action_type")}>
                  סוג פעולה{renderSortIndicator("action_type")}
                </TableCell>
                <TableCell align="left" onClick={() => handleHeaderClick("amount")}>
                  סכום{renderSortIndicator("amount")}
                </TableCell>
                {!readOnly && (
                  <TableCell align="center" sx={{ cursor: "default" }}>
                    פעולות
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {displayedActions.map((action) => {
                const actionLabel =
                  ActionTypes.find((item) => item.value === action.action_type)?.label ||
                  action.action_type;

                return (
                  <TableRow key={action.id} hover sx={{ "& td": { border: "none" } }}>
                    {showLoanColumn && (
                      <TableCell align="right">
                        {action.loan
                          ? `#${action.loan.id} - ${action.loan.user?.first_name ?? ""} ${
                              action.loan.user?.last_name ?? ""
                            }`
                          : "-"}
                      </TableCell>
                    )}

                    <TableCell align="right">
                      {new Date(action.date).toLocaleDateString("he-IL")}
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title={actionLabel}>
                        <Chip
                          label={actionLabel}
                          size="small"
                          color={
                            action.action_type === "LOAN_CREATED"
                              ? "secondary"
                              : action.action_type === "PAYMENT"
                                ? "success"
                                : action.action_type === "AMOUNT_CHANGE"
                                  ? "warning"
                                  : action.action_type === "MONTHLY_PAYMENT_CHANGE"
                                    ? "info"
                                    : action.action_type === "DATE_OF_PAYMENT_CHANGE"
                                      ? "primary"
                                      : "default"
                          }
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell align="left" sx={{ fontWeight: 600, color: "#007BFF" }}>
                      {action.action_type === LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE
                        ? `יום ${action.value} בחודש`
                        : action.value.toLocaleString("he-IL", {
                            style: "currency",
                            currency: "ILS",
                          })}
                    </TableCell>

                    {!readOnly && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                          <Tooltip title="העתקה">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(action)}
                              disabled={action.action_type === LoanPaymentActionType.LOAN_CREATED}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="עריכה">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(action)}
                                disabled={action.action_type === LoanPaymentActionType.LOAN_CREATED}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title="מחיקה">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteModal(true);
                                  setSelected(action);
                                }}
                                disabled={action.action_type === LoanPaymentActionType.LOAN_CREATED}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}

      {selected && !readOnly && (
        <EditLoanActionModal
          open={editModal}
          action={selected}
          onClose={() => setEditModal(false)}
          loanId={loanId ?? selected.loan?.id ?? 0}
        />
      )}

      {deleteModal && !readOnly && (
        <ConfirmModal
          open={deleteModal}
          text="מחק פעולה זו?"
          onSubmit={deleteAction}
          onClose={() => setDeleteModal(false)}
        />
      )}
    </Paper>
  );
};

export default ActionsTable;
