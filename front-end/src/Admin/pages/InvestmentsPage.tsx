import { Box, Container, Paper, SelectChangeEvent } from "@mui/material";
import { StatusGeneric } from "../../common/indexTypes";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getAllInvestments } from "../../store/features/admin/adminInvestmentsSlice";
import LoadingIndicator from "../components/StatusComponents/LoadingIndicator";
import InvestmentsHeader from "../components/Investments/InvestmentsHeader";
import InvestmentsDashboard from "../components/Investments/InvestmentDashboard/InvestmentsDashboard";

const Investments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [filter, setFilter] = useState<StatusGeneric>(StatusGeneric.ACTIVE);
  const investmens = useSelector((s:RootState)=> s.AdminInvestmentsSlice.allInvestments)
  useEffect(() => {
  dispatch(getAllInvestments())
  
  }, [dispatch,setFilter])
  const handleFilterChange = (e: SelectChangeEvent) => {
    setFilter(e.target.value as StatusGeneric);
  }
  const fixidInvestments = investmens.filter((inv)=> {
    if(filter == StatusGeneric.ALL) return inv
    if(filter == StatusGeneric.ACTIVE) return inv.is_active
    if(filter == StatusGeneric.INACTIVE) return !inv.is_active
  }
  )
  
  return (
    <>
      <Box sx={{ bgcolor: "#F8F8F8", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          {/* HEADER */}
     <InvestmentsHeader filter={filter} handleFilterChange={handleFilterChange}  />

          {status === "pending" && <LoadingIndicator />}

          {status === "fulfilled" && (
            <Box
              component={Paper}
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                overflowX: "auto",
              }}
            >
              {/* <Loans loansData={allLoans} total={total} /> */}
            </Box>
          )}
        <InvestmentsDashboard investmentsData={fixidInvestments} />
         
        </Container>
      </Box>
    </>
  );
};

export default Investments;
