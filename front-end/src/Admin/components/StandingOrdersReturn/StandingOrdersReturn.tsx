import { Box } from "@mui/material"
import StandingOrdersReturnHeader from "./StandingOrdersReturnHeader"

const StandingOrdersReturn = () => {
  return (
    <div><StandingOrdersReturnHeader />
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
                
              <Box
                sx={{
                  mb: 4,
                  p: { xs: 2, md: 3 }, 
                  bgcolor: "#FFFFFF", 
                  borderRadius: 2, 
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
            
              </Box>
            </Box>
            </Box>
    </div>
  )
}

export default StandingOrdersReturn