import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import  { FC } from "react";
interface FundCardProps {
  label: string;
  amount: number;
  selected?: boolean;
  onClick?: () => void;
}
const FundCard:FC<FundCardProps> = ({ label, amount, selected, onClick }) => {
  return  <Card
    sx={{
      borderRadius: 3,
      boxShadow: selected ? 4 : 1,
      bgcolor: selected ? "success.main" : "background.paper",
      transition: "0.2s",
      "&:hover": { boxShadow: 4 },
    }}
  >
    <CardActionArea onClick={onClick} sx={{ borderRadius: 3, p: 0.5 }}>
      <CardContent>
        <Typography variant="overline">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          {Number(amount || 0).toLocaleString("he-IL", {
            style: "currency",
            currency: "ILS",
          })}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>;
};

export default FundCard;
