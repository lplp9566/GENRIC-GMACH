import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../Admin/components/Users/UsersDto";
interface NotAdminProps {
  user: IUser;
}
export default function NotAdmin({ user }: NotAdminProps) {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
        <Typography variant="h4">שלום {user.first_name} {user.last_name}</Typography>
      <Typography variant="h4" color="error">
        הדף בבניה 🏗️
      </Typography>

      <Typography variant="body1">בקרוב ...</Typography>

      <Button variant="contained" onClick={() => navigate("/")}>
        חזרה לדף התחברות
      </Button>
    </Box>
  );
}
