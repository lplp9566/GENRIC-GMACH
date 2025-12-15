import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
interface UsersHeaderProps {
  filter: "all" | "members" | "friends";
  setFilter: React.Dispatch<
    React.SetStateAction<"all" | "members" | "friends">
  >;
}
const UsersHeader: FC<UsersHeaderProps> = ({ filter, setFilter }) => {
  const navigate = useNavigate();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        width: {
          xs: "100%",
          sm: "80%",
          md: "60%",
          lg: "40%",
        },
        mx: "auto",
        dir: "rtl",
      }}
    >
      <Stack spacing={3}>
        <Box
          component={Stack}
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={600} textAlign="center">
            ניהול משתמשים
          </Typography>
          <Box
            component="img"
            src="https://img.icons8.com/?size=100&id=103933&format=png&color=000000"
            alt="users icon"
            sx={{ width: 48, height: 48 }}
          />
        </Box>

        <Box
          component={Stack}
          direction={isXs ? "column" : "row"}
          spacing={2}
          justifyContent={isXs ? "center" : "space-between"}
          alignItems="center"
        >
          <FormControl size="small" sx={{ width: isXs ? "100%" : "auto" }}>
            <InputLabel id="users-filter-label">סינון</InputLabel>
            <Select
              labelId="users-filter-label"
              value={filter}
              label="סינון"
              onChange={(e) =>
                setFilter(e.target.value as "all" | "members" | "friends")
              }
            >
              <MenuItem value="all">הכל</MenuItem>
              <MenuItem value="members">חברים</MenuItem>
              <MenuItem value="friends">ידידים</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={() => navigate("/users/new")}
            sx={{
              bgcolor: "#2a8c82",
              color: "#fff",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                bgcolor: "#1f645f",
              },
            }}
          >
            הוסף משתמש
          </Button>

          <Button
            variant="outlined"
            // onClick={}
            sx={{
              borderColor: "#2a8c82",
              color: "#2a8c82",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                borderColor: "#1f645f",
                color: "#1f645f",
              },
            }}
          >
            ניהול דרגת משתמש
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default UsersHeader;
