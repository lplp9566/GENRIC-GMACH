import { Box, Typography } from "@mui/material"
import StandingOrdersReturnHeader from "./StandingOrdersReturnHeader"
import SummaryCard from "../Loans/LoansDashboard/SummaryCard"

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
              <SummaryCard label="סה״כ החזרי הוראות קבע" value="0" />
              <SummaryCard label="מספר הוראות קבע ששולמו " value="₪0" />
              <SummaryCard label="מספר החזרי הוראות קבע שלא שולמו " value="₪0" />
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
                <Typography variant="h6" gutterBottom>  
                  רשימת החזרי הוראות קבע
                </Typography>
            
            </Box>
            </Box>
    </div>
  )
}

export default StandingOrdersReturn