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
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { revertPaymentMethod } from "../../../common/revertTypes/PaymentMethed";
import TodayIcon from "@mui/icons-material/Today";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditUser from "./editUser";

const UserCard: React.FC<{ user: IUser }> = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  const [editModal, seteditModal] = useState(false);

  // נתוני סיכום
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
    // navigate(`/users/${user.id}/edit`);
  };
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
      <StyledCard onClick={() => toggleExpand()}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user.first_name[0]}
            </Avatar>
          }
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">
                {user.first_name} {user.last_name}
              </Typography>
              {isChargeToday && <TodayIcon color="info" fontSize="small" />}
            </Stack>
          }
          subheader={user.current_role?.name ?? "-"}
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
                label={`${mb.toLocaleString()} ₪`}
                size="small"
                sx={{ minWidth: 100 }}
                color={balanceColor}
                variant="outlined"
              />
              <Chip
                icon={anyLoanNeg ? <WarningAmberIcon /> : <SavingsIcon />}
                label={`${loans.length} הלווא${
                  loans.length !== 1 ? "ות" : "ה"
                }`}
                size="small"
                sx={{ minWidth: 100 }}
                color={anyLoanNeg ? "error" : "primary"}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        )}
{user.membership_type == MembershipType.FRIEND && (
  <Button
    variant="outlined"
    size="small"
    // onClick={onEdit}
    // startIcon={<EditIcon />}
  >
    הפוך לחבר 
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
          <CardContent sx={{ bgcolor: "grey.50" }}>
            {user.membership_type === MembershipType.MEMBER && (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  מאזן חודשי
                </Typography>

                <Typography
                  variant="h6"
                  color={balanceColor + ".main"}
                  gutterBottom
                >
                  {mb.toLocaleString()} ₪
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
                        ...
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
              <strong>ת"ז:</strong> {user.id_number}
            </Typography>
            <Typography variant="body2">
              <strong>הצטרפות:</strong>{" "}
              {user.join_date
                ? new Date(user.join_date).toLocaleDateString("he-IL")
                : "-"}
            </Typography>
            <Typography variant="body2">
              <strong>פרטי בנק:</strong> {user.payment_details.bank_number} /{" "}
              {user.payment_details.bank_branch} /{" "}
              {user.payment_details.bank_account_number}
            </Typography>
            <Typography variant="body2">
              <strong>תאריך חיוב:</strong> {user.payment_details.charge_date}
            </Typography>
            <Typography variant="body2">
              <strong>שיטת תשלום:</strong>{" "}
              {revertPaymentMethod(user.payment_details.payment_method)}
            </Typography>

            <Box mt={2} textAlign="right">
              <Button variant="contained" size="small" onClick={onEdit}>
                ערוך נתוני משתמש
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
