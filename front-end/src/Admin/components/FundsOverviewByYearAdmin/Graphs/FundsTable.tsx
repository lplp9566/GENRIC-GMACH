import { useState } from "react";
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
  const {selectedUser} = useSelector((state: RootState) => state.AdminUsers);
  const [openFull, setOpenFull] = useState(false);

  const TableContent = (
    <Table size="small">
      <TableHead sx={{ backgroundColor: "#e8eef3" }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>שנה</TableCell>
          {selectedFields.map((key) => (
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }} key={key}>
              {!selectedUser ? AdminYearlyFinancialItems.find((f) => f.key === key)?.label : UserAdminFinancialItems.find((f) => f.key === key)?.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={row.year}
            hover
            sx={{ '&:nth-of-type(odd)': { bgcolor: '#f9f9f9' }, cursor: 'pointer' }}
          >
            <TableCell sx={{ py: 1.2, px: 2, fontSize: '0.875rem', fontWeight: 'bold' }}>
              {row.year}
            </TableCell>
            {selectedFields.map((key) => (
              <TableCell sx={{ py: 1.2, px: 2, fontSize: '0.875rem' }} key={key}>
                {(row[key] ?? 0).toLocaleString()}
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
          bgcolor: "#ffffffc0",
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
          sx={{ backgroundColor: "#1E3A3A", color: "#fff", position: "relative", display: "flex", justifyContent: "center", gap: 1 }}
        >
          טבלה במסך מלא
          <IconButton
            sx={{ position: "absolute", top: 8, left: 8 ,color : openFull ? "#fff" : "#1E3A3A", }}
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
