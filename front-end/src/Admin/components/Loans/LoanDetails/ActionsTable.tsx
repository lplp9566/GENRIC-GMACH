import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
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
  loanId: number;
  readOnly?: boolean;
}

export const ActionsTable: React.FC<ActionsTableProps> = ({
  actions,
  loanId,
  readOnly,
}) => {
        const dispatch = useDispatch<AppDispatch>();

  const [currentSortField, setCurrentSortField] = useState<SortField>("date");
  const [editModal, setEditModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<ILoanAction | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [currentSortDirection, setCurrentSortDirection] =
    useState<SortDirection>("asc");

  const handleHeaderClick = (field: SortField) => {
    if (field === currentSortField) {
      // Toggle direction
      setCurrentSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setCurrentSortField(field);
      setCurrentSortDirection("asc");
    }
  };
  const ACTION_ORDER: LoanPaymentActionType[] = [
    LoanPaymentActionType.PAYMENT,
    LoanPaymentActionType.AMOUNT_CHANGE,
    LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE,
    LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE,
  ];
  const delateAction = () => {
    toast.promise(dispatch(deleteLoanAction({ id: selected!.id, loanId })), {
      pending: "Deleting action...",
      success: "Action deleted.",
      error: "Failed to delete action.",
    });
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
        ? " ▲"
        : " ▼"
      : "";
 const handleEdit = (action: ILoanAction) => {
    setSelected(action);
    setEditModal(true);
  };
  return (
    <Paper elevation={3} sx={{ borderRadius: 2, width: "99%" }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
      >
        פעולות על הלוואה
      </Typography>
      {actions.length === 0 && <Typography>לא נמצאו פעולות</Typography>}
      {actions.length > 0 && (
        <Table size="small" sx={{ borderSpacing: "0 6px" }}>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  fontWeight: 700,
                  cursor: "pointer",
                },
              }}
            >
              <TableCell
                align="right"
                onClick={() => handleHeaderClick("date")}
              >
                תאריך{renderSortIndicator("date")}
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleHeaderClick("action_type")}
              >
                סוג פעולה{renderSortIndicator("action_type")}
              </TableCell>
              <TableCell
                align="left"
                onClick={() => handleHeaderClick("amount")}
              >
                סכום{renderSortIndicator("amount")}
              </TableCell>
              {!readOnly && (
                <TableCell align="center" sx={{ cursor: "default" }}>
                  פעולות                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedActions.map((action) => (
              <TableRow
                key={action.id}
                hover
                sx={{ "& td": { border: "none" } }}
              >
                                <TableCell align="right">
                  {new Date(action.date).toLocaleDateString("he-IL")}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={
                      ActionTypes.find(
                        (item) => item.value === action.action_type
                      )?.label || action.action_type
                    }
                    size="small"
                    color={
                      action.action_type === "PAYMENT"
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
                </TableCell>
                <TableCell
                  align="left"
                  sx={{ fontWeight: 600, color: "#007BFF" }}
                >
  
                  {action.action_type !=
                    LoanPaymentActionType.DATE_OF_PAYMENT_CHANGE && (
            action.value.toLocaleString("he-IL", {
                    style: "currency",
                    currency: "ILS",
                  } )
                    ) }
      
                </TableCell>

                {!readOnly && (
                  <TableCell align="center">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Tooltip title="Copy">
                        <IconButton size="small" onClick={() => {}}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(action)}
                            // disabled={!onEdit}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteModal(true);
                              setSelected(action);
                            }}
                            disabled={
                              action.action_type !=
                              LoanPaymentActionType.PAYMENT
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                )}

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {selected && !readOnly && (
        <EditLoanActionModal
          open={editModal}
          action={selected}
          onClose={() => setEditModal(false)}
          loanId={loanId}
        />
      )}
      {deleteModal && !readOnly && (
        <ConfirmModal
          open={deleteModal}
          text="Delete this action?"
          onSubmit={delateAction}
          onClose={() => setDeleteModal(false)}
        />
      )}

    </Paper>
  );
};

export default ActionsTable;
