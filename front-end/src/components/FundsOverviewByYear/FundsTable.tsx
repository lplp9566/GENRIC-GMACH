import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { allFields } from "./fields";
interface Props {
  data: any[];
  selectedFields: string[];
}
const  FundsTable = ({ data, selectedFields }: Props)=> {
  return (
    <Box sx={{ mt: 2, maxWidth: "100%", overflowX: "auto", bgcolor: "#ffffffc0", borderRadius: 2, boxShadow: 1 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: "#f2f4f7" }}>
          <TableRow>
            <TableCell>שנה</TableCell>
            {selectedFields.map((key) => (
              <TableCell key={key}>{allFields.find(f => f.key === key)?.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.year}</TableCell>
              {selectedFields.map((key) => (
                <TableCell key={key}>{(row[key] ?? 0).toLocaleString()}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
export default FundsTable