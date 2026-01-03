import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { FC } from "react";

interface CategoryCardProps {
  label: string;
  amount: number;
  selected?: boolean;
  onClick?: () => void;
}

const CategoryCard: FC<CategoryCardProps> = ({
  label,
  amount,
  selected,
  onClick,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: selected ? 4 : 1,
        bgcolor: selected ? "error.main" : "background.paper",
        transition: "0.2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ borderRadius: 3, p: 0.5 }}>
        <CardContent>
          <Typography variant="overline">
            {label}
          </Typography>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ direction: "ltr" }}
          >
            {Number(amount || 0).toLocaleString("he-IL", {
              style: "currency",
              currency: "ILS",
            })}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CategoryCard;
