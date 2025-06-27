import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, List, ListItem, Typography } from '@mui/material';
import React, { FC } from 'react'
import { IMembershipRankDetails } from './ranksDto';
import {
  ExpandMore as ExpandMoreIcon,
 
} from "@mui/icons-material";
interface AllRanksProps{
    ranks :IMembershipRankDetails[] 
}
const AllRanks:FC<AllRanksProps> = ({ranks}) => {
  return (
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
  )
}

export default AllRanks