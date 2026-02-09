import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import React, { FC, useState } from "react";
import { IMembershipRankDetails, IMonthlyRank } from "./ranksDto";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import EditMonthlyRatesModal from "./EditMonthlyRatesModal";
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmModal from "../genricComponents/confirmModal";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import { deleteMembershipRank } from "../../../store/features/admin/adminRankSlice";
interface AllRanksProps {
  ranks: IMembershipRankDetails[];
}
const AllRanks: FC<AllRanksProps> = ({ ranks }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [monthlyRatesEditModal, setMonthlyRatesEditModal] = useState(false);
  const [monthlyRatesDeleteModal, setMonthlyRatesDeleteModal] = useState(false);
  const [currentMonthlyRate, setCurrentMonthlyRate] = useState<IMonthlyRank>();
  const handeleDelete = async () => {
    setMonthlyRatesDeleteModal(false);
    toast.promise(
      dispatch(deleteMembershipRank(currentMonthlyRate!.id)).unwrap(),
      {
        pending: "ממתין...",
        success: "הדרגה נמחקה בהצלחה! 👌",
        error: "שגיאה במחיקת הדרגה 💥",
      }
    );
  };
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
              // bgcolor: "#f6f7f7",
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
                // color: "#fff",
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

            <AccordionDetails
              dir="rtl"
              sx={{ p: 2, display: "flex", justifyContent: "center" }}
            >
              {rank.monthlyRates.length ? (
                <List disablePadding>
                  {rank.monthlyRates.map((h, i) => (
                    <React.Fragment key={i}>
                      <ListItem
                        sx={{
                          display: "flex",
                          flexDirection: "row-reverse", // טקסט בימין, אייקונים בשמאל
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        <Box display="flex" marginRight={40} gap={1}>
                          <Tooltip title="עריכה">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => {
                                setCurrentMonthlyRate({
                                  amount: h.amount,
                                  effective_from: h.effective_from,
                                  id: h.id,
                                  role: rank,
                                  name: "",
                                });
                                setMonthlyRatesEditModal(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="מחיקה">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {setMonthlyRatesDeleteModal(true)
                                       setCurrentMonthlyRate({
                                  amount: h.amount,
                                  effective_from: h.effective_from,
                                  id: h.id,
                                  role: rank,
                                  name: "",
                                });
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-end"
                        >
                          <Typography>סכום: {h.amount.toFixed(2)} ₪</Typography>
                          <Typography>
                            תאריך:{" "}
                            {new Date(h.effective_from).toLocaleDateString(
                              "he-IL"
                            )}
                          </Typography>
                        </Box>
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
            {monthlyRatesEditModal && (
              <EditMonthlyRatesModal
                defaultAmount={currentMonthlyRate?.amount!}
                defaultDate={currentMonthlyRate?.effective_from.slice(0, 10)!}
                open={monthlyRatesEditModal}
                onClose={() => setMonthlyRatesEditModal(false)}
                id={currentMonthlyRate?.id!}
              />
            )}
            {monthlyRatesDeleteModal && (
              <ConfirmModal
                onClose={() => setMonthlyRatesDeleteModal(false)}
                open={monthlyRatesDeleteModal}
                onSubmit={handeleDelete}
                text="האם אתה בטוח שברצונך למחוק ערך זה?"
              />
            )}
          </Accordion>
        );
      })}
    </Box>
  );
};

export default AllRanks;
