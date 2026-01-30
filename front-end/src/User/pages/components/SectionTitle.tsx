import { Typography } from "@mui/material";

type Props = {
  children: string;
};

const SectionTitle = ({ children }: Props) => (
  <Typography variant="h5" fontWeight={900} mb={2}>
    {children}
  </Typography>
);

export default SectionTitle;
