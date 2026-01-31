import { Grid } from "@mui/material";
import SectionTitle from "./SectionTitle";
import UserStatCard from "./UserStatCard";
import { formatILS } from "../../../../Admin/components/HomePage/HomePage";

interface UserDepositsLoansSectionProps {
  depositsNowAmount: number;
  totalFixedDepositsDeposited: number;
  totalFixedDepositsWithdrawn: number;
  loansNowByTakenMinusRepaid: number;
  totalLoansTaken: number;
  totalLoansRepaid: number;
  accent: string;
  accentSoft: string;
  surface: string;
  softBorder: string;
  isDark: boolean;
};

const UserDepositsLoansSection = ({
  depositsNowAmount,
  totalFixedDepositsDeposited,
  totalFixedDepositsWithdrawn,
  loansNowByTakenMinusRepaid,
  totalLoansTaken,
  totalLoansRepaid,
  accent,
  accentSoft,
  surface,
  softBorder,
  isDark,
}: UserDepositsLoansSectionProps) => (
  <>
    <SectionTitle>הפקדות והלוואות כרגע</SectionTitle>

    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <UserStatCard
          title="הפקדות נטו (כרגע)"
          value={formatILS(depositsNowAmount)}
          subtitle={`סה"כ הופקד: ${formatILS(totalFixedDepositsDeposited)} • סה"כ נמשך: ${formatILS(
            totalFixedDepositsWithdrawn
          )}`}
          tone="accent"
          icon="💰"
          accent={accent}
          accentSoft={accentSoft}
          surface={surface}
          softBorder={softBorder}
          isDark={isDark}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <UserStatCard
          title="כסף בהלוואה כרגע"
          value={formatILS(loansNowByTakenMinusRepaid)}
          subtitle={`נלקח: ${formatILS(totalLoansTaken)} • הוחזר: ${formatILS(totalLoansRepaid)}`}
          tone="accent"
          icon="📌"
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
