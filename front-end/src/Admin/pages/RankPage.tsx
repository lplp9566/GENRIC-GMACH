import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,

  List,
  ListItem,
  Divider,
  Container,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,

} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import RankHeader from "../components/ranks/RankHeader";
import AddRankModal from "../components/ranks/AddRankModal";
import ManageRankModal from "../components/ranks/manageRankModal";

type HistoryEntry = {
  amount: number;
  date: string;
  method?: string;
  notes?: string;
};
interface Rank {
  id: number;
  name: string;
  history: HistoryEntry[];
}

const RanksManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [ranks, setRanks] = useState<Rank[]>([
    { id: 1, name: "דרגה א", history: [{ amount: 100, date: "2025-01-01" }] },
    { id: 2, name: "דרגה ב", history: [{ amount: 200, date: "2025-02-15" }] },
    { id: 3, name: "דרגה ג", history: [] },
  ]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openManage, setOpenManage] = useState(false);
  const handleAddOpen = () => setOpenAdd(true);
  const handleManageOpen = () => {
    setOpenManage(true);
  };

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Button
          // startIcon={<ArrowForwardIcon />}
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ color: "#2a8c82", borderColor: "#2a8c82" }}
        >{`${" <"} ${"חזרה"}`}</Button>
        <RankHeader
          handleAddOpen={handleAddOpen}
          handleManageOpen={handleManageOpen}
        />
      </Box>
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <HistoryIcon sx={{ color: "#2e2e2e", mr: 1 }} />
          <Typography variant="h6" color="#2e2e2e" textAlign="right">
            דרגות במערכת
          </Typography>
        </Box>
        {ranks.map((rank) => {
          const latest = rank.history[rank.history.length - 1];
          return (
            <Accordion key={rank.id} sx={{ mb: 1, borderRadius: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" justifyContent="space-between" width="100%">
                  <Typography color="#2e2e2e" textAlign="right">
                    {rank.name}
                  </Typography>
                  <Typography color="#2e2e2e" textAlign="right">
                    {latest ? `${latest.amount} ₪` : "0 ₪"}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "#fafafa", p: 2 }}>
                {rank.history.length ? (
                  <List>
                    {rank.history.map((h, i) => (
                      <React.Fragment key={i}>
                        <ListItem>
                          <Box>
                            <Typography textAlign="right">
                              סכום: {h.amount} ₪
                            </Typography>
                            <Typography textAlign="right">
                              תאריך: {h.date}
                            </Typography>
                            {h.method && (
                              <Typography textAlign="right">
                                אמצעי: {h.method}
                              </Typography>
                            )}
                            {h.notes && (
                              <Typography textAlign="right">
                                הערות: {h.notes}
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                        {i < rank.history.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography color="#2e2e2e" textAlign="right">
                    אין היסטוריה
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Add Dialog */}

      <AddRankModal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
        }}
      />
      <ManageRankModal
        openManage={openManage}
        onClose={() => {
          setOpenManage(false);
        }}
      />
    </Container>
  );
};

export default RanksManagementPage;
