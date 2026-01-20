import { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { AdminYearlyFinancialItems, UserAdminFinancialItems } from "../items";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

interface Props {
  data: any[];
  selectedFields: string[];
}

const FundsTable = ({ data, selectedFields }: Props) => {
  const { selectedUser } = useSelector((state: RootState) => state.AdminUsers);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const isAdmin = Boolean(authUser?.is_admin);

  const [openFull, setOpenFull] = useState(false);

  const items = useMemo(() => {
    return isAdmin && !selectedUser
      ? AdminYearlyFinancialItems
      : UserAdminFinancialItems;
  }, [isAdmin, selectedUser]);

  const labelByKey = useMemo(() => {
    return Object.fromEntries(items.map((i) => [i.key, i.label]));
  }, [items]);

  const TableContent = (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: "bold", py: 1.5 }}>שנה</TableCell>

          {selectedFields.map((key) => (
            <TableCell sx={{ fontWeight: "bold", py: 1.5 }} key={key}>
              {labelByKey[key] ?? key}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {data.map((row) => (
          <TableRow key={row.year} hover>
            <TableCell
              sx={{ py: 1.2, px: 2, fontSize: "0.875rem", fontWeight: "bold" }}
            >
              {row.year}
            </TableCell>

            {selectedFields.map((key) => (
              <TableCell
                sx={{ py: 1.2, px: 2, fontSize: "0.875rem" }}
                key={key}
              >
                {Number(row?.[key] ?? 0).toLocaleString()}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Box
        sx={{
          mt: 2,
          maxWidth: "100%",
          maxHeight: 350,
          overflow: "auto",
          borderRadius: 2,
          boxShadow: 1,
          position: "relative",
        }}
      >
        <Tooltip title="מסך מלא">
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
            onClick={() => setOpenFull(true)}
          >
            <OpenInFullIcon />
          </IconButton>
        </Tooltip>

        {TableContent}
      </Box>

      <Dialog fullScreen open={openFull} onClose={() => setOpenFull(false)}>
        <DialogTitle
          sx={{
            backgroundColor: "#1E3A3A",
            color: "#fff",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          טבלה במסך מלא
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              color: "#fff",
            }}
            onClick={() => setOpenFull(false)}
          >
            <CloseFullscreenIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>{TableContent}</DialogContent>
      </Dialog>
    </>
  );
};

export default FundsTable;
