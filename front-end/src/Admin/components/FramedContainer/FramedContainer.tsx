import { Paper } from "@mui/material";

const FramedContainer: any = ({ children }: { children: React.ReactNode }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,                                  
        bgcolor: "#ffffff",                      
        border: "1px solid rgba(0, 0, 0, 0.08)",  
        borderRadius: "16px",                     
        maxWidth: 800,                            
        mx: "auto",                               
      }}
    >
      {children}
    </Paper>
  );
}
export default FramedContainer;
