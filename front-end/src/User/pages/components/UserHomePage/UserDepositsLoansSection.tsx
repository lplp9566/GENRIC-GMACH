import { Grid } from "@mui/material";
import SectionTitle from "./SectionTitle";
import UserStatCard from "./UserStatCard";
import { formatILS } from "../../../../Admin/components/HomePage/HomePage";

interface UserDepositsLoansSectionProps {
  depositsNowAmount: number;
  loansNowByTakenMinusRepaid: number;
  accent: string;
  accentSoft: string;
  surface: string;
  softBorder: string;
  isDark: boolean;
}

const UserDepositsLoansSection = ({
  depositsNowAmount,
  loansNowByTakenMinusRepaid,
  accent,
  accentSoft,
  surface,
  softBorder,
  isDark,
}: UserDepositsLoansSectionProps) => (
  <>
    <SectionTitle align="center">הפקדות והלוואות פעילות</SectionTitle>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <UserStatCard
          title="הפקדות  פעילות "
          value={formatILS(depositsNowAmount)}
          tone="accent"
          icon="💰"
          centered
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <UserStatCard
          title="הלוואות  פעילות "
          value={formatILS(loansNowByTakenMinusRepaid)}
          tone="accent"
          icon="📌"
          centered
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Grid>
    </Grid>
  </>
);

export default UserDepositsLoansSection;
