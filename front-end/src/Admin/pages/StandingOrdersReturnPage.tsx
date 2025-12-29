import StandingOrdersReturn from '../components/StandingOrdersReturn/StandingOrdersReturn'
import Box from '@mui/material/Box/Box'
import { Container } from '@mui/material'

const StandingOrdersReturnPage = () => {
  return (
       <Box sx={{ bgcolor: "#F8F8F8", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <StandingOrdersReturn />
          </Container>
      </Box>
  )
}

export default StandingOrdersReturnPage