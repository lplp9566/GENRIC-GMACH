// src/pages/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { getAllUsers } from "../../store/features/admin/adminUsersSlice";
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
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  styled,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TodayIcon from "@mui/icons-material/Today";
import UsersHeader from "../components/Users/UsersHeader";
import { IUser } from "../components/Users/UsersDto";
import { revertPaymentMethod } from "../../common/revertTypes/PaymentMethed";


// כפתור ה־Expand עם סיבוב
interface ExpandMoreProps {
  expand: boolean;
}
const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})<ExpandMoreProps>(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const UserCard: React.FC<{ user: IUser }> = ({ user }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // חישובי סיכום
  const mb = user.payment_details.monthly_balance;
  const loans = user.payment_details.loan_balances;
  const anyLoanNeg = loans.some((l) => l.balance < 0);

  // בודק אם היום הוא יום החיוב
  const today = new Date().getDate();
  const isChargeToday = user.payment_details.charge_date === today;

  // צבעי תוויות
  const balanceColor = mb < 0 ? "error" : "success";

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${user.id}/edit`);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        transition: "box-shadow 0.3s",
        "&:hover": { boxShadow: 6 },
        cursor: "pointer",
      }}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: "#2a8c82" }}>
            {user.first_name.charAt(0)}
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              {user.first_name} {user.last_name}
            </Typography>
            {isChargeToday && (
              <TodayIcon
                color="info"
                fontSize="small"
                titleAccess="היום יום חיוב"
              />
            )}
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {user.current_role.name}
          </Typography>
        }
      />

      {/* אימייל */}
      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {user.email_address}
        </Typography>
      </CardContent>

      {/* סיכום חיוני תמידי */}
      <Box
        px={2}
        pb={1}
        display="flex"
        gap={1}
        flexWrap="wrap"
        alignItems="center"
      >
        <Chip
          icon={<AccountBalanceWalletIcon />}
          label={`${mb.toLocaleString()} ₪`}
          size="small"
          color={balanceColor}
          variant="outlined"
          sx={{ borderColor: mb < 0 ? "error.main" : undefined }}
        />
        <Chip
          icon={anyLoanNeg ? <WarningAmberIcon /> : <SavingsIcon />}
          label={`${loans.length} הלוואה${loans.length !== 1 ? "ות" : ""}`}
          size="small"
          color={anyLoanNeg ? "error" : "primary"}
          variant="outlined"
        />
      </Box>

      <Divider />

      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded}
          onClick={handleExpand}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      {/* פרטים מלאים במצב מורחב */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ bgcolor: "#fafafa" }}>
          {/* מאזן חודשי */}
          <Box mb={2}>
            <Typography variant="subtitle2">מאזן חודשי</Typography>
            <Typography
              variant="h6"
              color={mb < 0 ? "error.main" : "text.primary"}
            >
              {mb.toLocaleString()} ₪
            </Typography>
          </Box>

          {/* פירוט הלוואות */}
          <Box mb={2}>
            <Typography variant="subtitle2">פירוט הלוואות</Typography>
            <List disablePadding>
              {loans.map((ln) => {
                const neg = ln.balance < 0;
                return (
                  <ListItem
                    key={ln.loanId}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: neg ? "error.lighter" : "grey.50",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: neg ? "error.main" : undefined }}>
                        {neg ? <WarningAmberIcon /> : <SavingsIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`הלוואה #${ln.loanId}`}
                      secondary={
                        <Typography
                          component="span"
                          color={neg ? "error.main" : "text.primary"}
                        >
                          {ln.balance.toLocaleString()} ₪
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* שאר פרטים */}
          <Typography variant="body2">
            <strong>טלפון:</strong> {user.phone_number}
          </Typography>
          <Typography variant="body2">
            <strong>ת"ז:</strong> {user.id_number}
          </Typography>
          <Typography variant="body2">
            <strong>תאריך הצטרפות:</strong>{" "}
            {user.join_date
              ? new Date(user.join_date).toLocaleDateString("he-IL")
              : "-"}
          </Typography>
          <Typography variant="body2">
            <strong>פרטי בנק:</strong> بنك #{user.payment_details.bank_number}  
            סניף #{user.payment_details.bank_branch} חשבון #
            {user.payment_details.bank_account_number}
          </Typography>
          <Typography variant="body2">
            <strong>אופן תשלום:</strong>{" "}
            {revertPaymentMethod(user.payment_details.payment_method)}
          </Typography>

          {/* כפתור עריכה */}
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              onClick={handleEdit}
            >
              ערוך נתוני משתמש
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

const UsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((s: RootState) => s.AdminUsers.allUsers);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  return (
    <Container
      sx={{
        py: 4,
        direction: "rtl",
        bgcolor: "#F9FBFC",
        fontFamily: "Heebo, Arial, sans-serif",
      }}
      maxWidth="lg"
    >
      <UsersHeader />

      <Box
        sx={{
          bgcolor: "#FFFFFF",
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          mt: 4,
        }}
      >
        {users?.length ? (
          <Grid container spacing={3}>
            {users.map((u) => (
              <Grid key={u.id} item xs={12} sm={6} md={4} lg={3}>
                <UserCard user={u} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography align="center" sx={{ py: 8, color: "text.secondary" }}>
            לא נמצאו משתמשים
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default UsersPage;
