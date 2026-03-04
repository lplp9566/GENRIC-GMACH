import { Typography } from "@mui/material";

type Props = {
  children: string;
  align?: "inherit" | "left" | "center" | "right";
};

const SectionTitle = ({ children, align = "inherit" }: Props) => (
  <Typography variant="h5" fontWeight={900} mb={2} textAlign={align}>
    {children}
  </Typography>
);

export default SectionTitle;
