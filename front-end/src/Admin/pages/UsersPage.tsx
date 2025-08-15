// src/pages/UsersPage.tsx
import  { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getAllUsers } from "../../store/features/admin/adminUsersSlice";
import {
  Box,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import UsersHeader from "../components/Users/UsersHeader";
import UserCard from "../components/Users/UserCard";



export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((s: RootState) => s.AdminUsers.allUsers);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        bgcolor: "background.default",
        direction: "rtl",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      <UsersHeader />

      <Box
        sx={{
          mt: 4,
          p: { xs: 2, md: 4 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 1,
        }}
      >
        {users?.length ? (
          <Grid container spacing={3}>
            {users.map((u) => (
              <Grid key={u.id} item xs={12} sm={6} md={4} lg={3}>
                <UserCard user={u} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
            לא נמצאו משתמשים
          </Typography>
        )}
      </Box>
    </Container>
  );
}


