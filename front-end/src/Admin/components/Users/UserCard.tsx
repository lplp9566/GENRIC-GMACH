import { useState } from "react";
import { IUser, MembershipType } from "./UsersDto";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { revertPaymentMethod } from "../../../common/revertTypes/PaymentMethed";
import TodayIcon from "@mui/icons-material/Today";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditUser from "./editUser";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const UserCard: React.FC<{ user: IUser }> = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  const [editModal, seteditModal] = useState(false);

  const mb = user.payment_details.monthly_balance!;
  if (mb === null) return null;
  const loans = user.payment_details.loan_balances;
  const anyLoanNeg = loans.some((l) => l.balance < 0);
  const today = new Date().getDate();
  const isChargeToday = user.payment_details.charge_date === today;
  const balanceColor = mb < 0 ? "error" : "success";

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded((prev) => !prev);
  };
  const onEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    seteditModal(true);
  };

  const primaryFirst = user.first_name ?? "";
  const primaryLast = user.last_name ?? "";
  const spouseFirst = user.spouse_first_name ?? "";
  const spouseLast = user.spouse_last_name ?? "";
  const spouseId = user.spouse_id_number ?? "";

  const hasSpouse = Boolean(spouseFirst || spouseLast || spouseId);
  const lastDisplay = hasSpouse && spouseLast && spouseLast !== primaryLast
    ? `${primaryLast} / ${spouseLast}`
    : primaryLast;
  const firstDisplay = hasSpouse && spouseFirst
    ? `${primaryFirst} + ${spouseFirst}`
    : primaryFirst;
  const idsDisplay = hasSpouse && spouseId
    ? `${user.id_number} / ${spouseId}`
    : user.id_number;

  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create("box-shadow", {
      duration: theme.transitions.duration.short,
    }),
    cursor: "pointer",
    "&:hover": {
      boxShadow: theme.shadows[6],
    },
  }));
  interface ExpandMoreProps {
    expand: boolean;
  }
  const ExpandMore = styled((props: any) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })<ExpandMoreProps>(({ theme, expand }) => ({
    transform: expand ? "rotate(180deg)" : "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  }));
  return (
    <>
      <StyledCard onClick={() => toggleExpand()} sx={{ position: "relative" }}>
        {user.is_member && (
          <EmojiEventsIcon
            titleAccess="חבר"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 2,
              fontSize: 18,
              color: "warning.main",
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
            }}
          />
        )}
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {primaryFirst[0]}
            </Avatar>
          }
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">
                {firstDisplay} {lastDisplay}
              </Typography>
              {isChargeToday && <TodayIcon color="info" fontSize="small" />}
            </Stack>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              ת"ז: {idsDisplay}
            </Typography>
          }
          sx={{ pb: 0 }}
        />

        <CardContent sx={{ pt: 0, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {user.email_address}
          </Typography>
        </CardContent>

        {user.membership_type === MembershipType.MEMBER && (
          <CardContent sx={{ pt: 0, pb: 1 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                icon={<AccountBalanceWalletIcon />}
                label={`${mb.toLocaleString()} ש"ח`}
                size="small"
                sx={{ minWidth: 100 }}
                color={balanceColor}
                variant="outlined"
              />
              <Chip
                icon={anyLoanNeg ? <WarningAmberIcon /> : <AccountBalanceIcon />}
                label={`${loans.length} הלווא${loans.length !== 1 ? "ות" : "ה"}`}
                size="small"
                sx={{ minWidth: 100 }}
                color={anyLoanNeg ? "error" : "primary"}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        )}
        {user.membership_type == MembershipType.FRIEND && (
          <Button variant="outlined" size="small">
            משתמש חבר
          </Button>
        )}
        <Divider />

        <CardActions disableSpacing sx={{ px: 2, py: 1 }}>
          <ExpandMore
            expand={expanded}
            onClick={toggleExpand}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {user.membership_type === MembershipType.MEMBER && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  מצב חודשי
                </Typography>
                <Typography
                  variant="h6"
                  color={balanceColor + ".main"}
                  gutterBottom
                >
                  {mb.toLocaleString()} ש"ח
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  פירוט הלוואות
                </Typography>
                <List disablePadding sx={{ mb: 2 }}>
                  {loans.map((ln) => {
                    const neg = ln.balance < 0;
                    return (
                      <ListItem
                        key={ln.loanId}
                        sx={{
                          borderRadius: 1,
                          bgcolor: neg ? "error.lighter" : "background.paper",
                          mb: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: neg ? "error.main" : "success.main",
                            }}
                          >
                            {neg ? <WarningAmberIcon /> : <AccountBalanceIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`#${ln.loanId}`}
                          secondary={`${ln.balance.toLocaleString()} ש"ח`}
                          secondaryTypographyProps={{
                            color: neg ? "error.main" : "text.primary",
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2">
              <strong>טלפון:</strong> {user.phone_number}
            </Typography>
            <Typography variant="body2">
              <strong>ת"ז:</strong> {idsDisplay}
            </Typography>
            <Typography variant="body2">
              <strong>תאריך הצטרפות:</strong>{" "}
              {user.join_date
                ? new Date(user.join_date).toLocaleDateString("he-IL")
                : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>בנק:</strong> {user.payment_details.bank_number} /{" "}
              {user.payment_details.bank_branch} /{" "}
              {user.payment_details.bank_account_number}
            </Typography>
            <Typography variant="body2">
              <strong>תאריך חיוב:</strong> {user.payment_details.charge_date}
            </Typography>
            <Typography variant="body2">
              <strong>אמצעי תשלום:</strong>{" "}
              {revertPaymentMethod(user.payment_details.payment_method)}
            </Typography>

            <Box mt={2} textAlign="right">
              <Button variant="contained" size="small" onClick={onEdit}>
                עריכת משתמש
              </Button>
            </Box>
          </CardContent>
        </Collapse>
      </StyledCard>
      {editModal && (
        <EditUser
          open={editModal}
          user={user}
          onClose={() => seteditModal(false)}
        />
      )}
    </>
  );
};
export default UserCard;
