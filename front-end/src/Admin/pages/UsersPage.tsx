import  { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAllUsers } from '../../store/features/admin/adminUsersSlice';
import { Box, Container } from '@mui/material';
import UsersHeader from '../components/Users/UsersHeader';

const UsersPage = () => {
      const dispatch = useDispatch<AppDispatch>();
      const users = useSelector((state: RootState) => state.AdminUsers.allUsers);
      console.log(users)
    useEffect(() => {
        dispatch(getAllUsers())
    }, [dispatch]);
  return (
       <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC", 
        fontFamily: 'Heebo, Arial, sans-serif',
      }}
    >
      
      <UsersHeader />
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          minHeight: "100vh", 
          pt: 4, 
          direction: "rtl",
          borderRadius: 3, 
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)", 
          mt: 4, 
        }}
      >
        <Box
          sx={{
            bgcolor: "#FBFDFE", 
            padding: { xs: 2, md: 3 }, 
            borderRadius: 2, 
            mb: 4,

          }}
        >


          </Box>
        </Box>
    </Container>
  )
}

export default UsersPage