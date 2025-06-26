import React, { useEffect, useState } from "react";
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
 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import RankHeader from "../components/ranks/RankHeader";
import AddRankModal from "../components/ranks/AddRankModal";
import ManageRankModal from "../components/ranks/manageRankModal";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { getAllMonthlyRanks } from "../../store/features/admin/adminRankSlice";
import FramedContainer from "../components/FramedContaine/FramedContaine";

const RanksManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(getAllMonthlyRanks());
  }, [dispatch]);

  const navigate = useNavigate();
  const ranks = useSelector(
    (state: RootState) => state.AdminRankSlice.monthlyRanks
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [openManage, setOpenManage] = useState(false);

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
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ color: "#5f7d7b", borderColor: "#5f7d7b" }}
        >
          {"< חזרה"}
        </Button>
        <RankHeader
          handleAddOpen={() => setOpenAdd(true)}
          handleManageOpen={() => setOpenManage(true)}
        />
      </Box>

      {/* כותרת מעל האקורדיונים */}
      <FramedContainer>
        <Box mb={3} textAlign="center">
          <Typography variant="h5" fontWeight={600} color="#2e2e2e">
            דרגות במערכת
          </Typography>
        </Box>

        {/* רשימת האקורדיונים במרכז */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          {ranks.map((rank) => {
            const latest = rank.monthlyRates[0];
            return (
              <Accordion
                key={rank.id}
                sx={{
                  width: "100%",
                  maxWidth: 600,
                  bgcolor: "#f6f7f7",
                  boxShadow: 1,
                  borderRadius: 2,
                  mx: "auto",
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: 4 },
                  "& .MuiAccordionSummary-root": {
                    borderRadius: "8px 8px 0 0",
                  },
                  "& .MuiAccordionDetails-root": {
                    borderRadius: "0 0 8px 8px",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
                  sx={{
                    bgcolor: "#5f7d7b",
                    color: "#fff",
                    px: 2,
                    py: 1,
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  }}
                  // dir="rtl"
                >
                  <Typography sx={{ textAlign: "right" }}>
                    שם הדרגה: {rank.name}
                  </Typography>
                  <Typography sx={{ textAlign: "right" }}>
                    הסכום הנוכחי: {latest ? latest.amount.toFixed(2) : "0"} ₪
                  </Typography>
                </AccordionSummary>

                <AccordionDetails dir="rtl" sx={{ p: 2, display: "flex", justifyContent:"center"}}>
                  {rank.monthlyRates.length ? (
                    <List disablePadding>
                      {rank.monthlyRates.map((h, i) => (
                        <React.Fragment key={i}>
                          <ListItem
                            sx={{
                              flexDirection: "column",
                              alignItems: "flex-end",
                              py: 1,
                            }}
                          >
                            <Typography sx={{ textAlign: "right" }}>
                              סכום: {h.amount.toFixed(2)} ₪
                            </Typography>
                            <Typography sx={{ textAlign: "right" }}>
                              תאריך:{" "}
                              {new Date(h.effective_from).toLocaleDateString(
                                "he-IL"
                              )}
                            </Typography>
                          </ListItem>
                          {i < rank.monthlyRates.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography textAlign="center" color="#888">
                      אין היסטוריה
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </FramedContainer>

      {/* המודים */}
      <AddRankModal open={openAdd} onClose={() => setOpenAdd(false)} />
      <ManageRankModal
        openManage={openManage}
        onClose={() => setOpenManage(false)}
      />
    </Container>
  );
};

export default RanksManagementPage;
