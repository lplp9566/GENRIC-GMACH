import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { IAddUserFormData, payment_method } from "../UsersDto";
import SelectRank from "../../SelectRank/SelectRank";
import { AppDispatch } from "../../../../store/store";
import { useDispatch } from "react-redux";
import { createUser } from "../../../../store/features/admin/adminUsersSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const steps = ["פרטים אישיים", "פרטי תשלום", "סיכום ואישור"];

const initialState: IAddUserFormData = {
  userData: {
    first_name: "",
    last_name: "",
    id_number: "",
    join_date: "",
    password: "",
    email_address: "",
    phone_number: "",
    is_admin: false,
    current_role: 1,
  },
  paymentData: {
    bank_number: 0,
    bank_branch: 0,
    bank_account_number: 0,
    charge_date: "",
    payment_method: payment_method.direct_debit,
  },
};

const AddNewUser: React.FC = () => {
const dispatch = useDispatch<AppDispatch>();
      const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<IAddUserFormData>(initialState);

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleUserChange =
    (key: keyof IAddUserFormData["userData"]) =>
    (
      e: React.ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | { name?: string; value: unknown }
      >
    ) => {
      setData((d) => ({
        ...d,
        userData: { ...d.userData, [key]: e.target.value },
      }));
    };

  const handlePaymentChange =
    (key: keyof IAddUserFormData["paymentData"]) =>
    (
      e: React.ChangeEvent<
        | HTMLInputElement
        | HTMLTextAreaElement
        | { name?: string; value: unknown }
      >
    ) => {
      setData((d) => ({
        ...d,
        paymentData: { ...d.paymentData, [key]: e.target.value },
      }));
    };
  const handleSubmit = () => {
  const promise = dispatch(createUser(data));
  toast.promise(
    promise,
    {
      pending: "יוצר את המשתמש…",
      success: "המשתמש נוצר בהצלחה! 👌",
      error: "שגיאה ביצירת המשתמש 💥",
    },
    { autoClose: 3000 }
  ).then(() => {
    setData(initialState);
    setActiveStep(0);
    navigate("/users");

  })

  };
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box display="grid" gap={2} mb={2}>
            <TextField
              label="שם פרטי"
              value={data.userData.first_name}
              onChange={handleUserChange("first_name")}
              fullWidth
            />
            <TextField
              label="שם משפחה"
              value={data.userData.last_name}
              onChange={handleUserChange("last_name")}
              fullWidth
            />
            <TextField
              label="תז"
              value={data.userData.id_number}
              onChange={handleUserChange("id_number")}
              fullWidth
            />
            <TextField
              label="תאריך הצטרפות"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={data.userData.join_date}
              onChange={handleUserChange("join_date")}
              fullWidth
            />
            <TextField
              label="אימייל"
              type="email"
              value={data.userData.email_address}
              onChange={handleUserChange("email_address")}
              fullWidth
            />
            <TextField
              label="טלפון"
              value={data.userData.phone_number}
              onChange={handleUserChange("phone_number")}
              fullWidth
            />
            <TextField
              label="סיסמה"
              type="password"
              value={data.userData.password}
              onChange={handleUserChange("password")}
              fullWidth
            />
            <SelectRank
              onChange={(rankId) =>
                setData((d) => ({
                  ...d,
                  userData: { ...d.userData, current_role: rankId },
                }))
              }
              value={data.userData.current_role}
            />{" "}
          </Box>
        );
      case 1:
        return (
          <Box display="grid" gap={2} mb={2}>
            <TextField
              label="בנק"
              value={data.paymentData.bank_number}
              onChange={handlePaymentChange("bank_number")}
              fullWidth
            />
            <TextField
              label="סניף"
              value={data.paymentData.bank_branch}
              onChange={handlePaymentChange("bank_branch")}
              fullWidth
            />
            <TextField
              label="חשבון"
              value={data.paymentData.bank_account_number}
              onChange={handlePaymentChange("bank_account_number")}
              fullWidth
            />
            <TextField
              label="תאריך חיוב"
              InputLabelProps={{ shrink: true }}
              value={data.paymentData.charge_date}
              onChange={handlePaymentChange("charge_date")}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>אופן תשלום</InputLabel>
              <Select
                value={data.paymentData.payment_method}
                label="אופן תשלום"
                onChange={() => handlePaymentChange("payment_method")}
              >
                <MenuItem value={payment_method.direct_debit}>
                  הוראת קבע
                </MenuItem>
                <MenuItem value={payment_method.cash}>מזומן</MenuItem>
                <MenuItem value={payment_method.credit_card}>אשראי</MenuItem>
                <MenuItem value={payment_method.bank_transfer}>הוראת קבע</MenuItem>
                <MenuItem value={payment_method.other}>אחר</MenuItem>
            
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Paper
            variant="outlined"
            sx={{ p: 3, backgroundColor: "#e9f5e9", mb: 2 }}
          >
            <Typography variant="h6" gutterBottom>
              סיכום הנתונים
            </Typography>
            <Typography>
              שם: {data.userData.first_name} {data.userData.last_name}
            </Typography>
            <Typography>תז: {data.userData.id_number}</Typography>
            <Typography>דוא"ל: {data.userData.email_address}</Typography>
            <Typography>טלפון: {data.userData.phone_number}</Typography>
            <Typography>
              מנהל: {data.userData.is_admin ? "כן" : "לא"}
            </Typography>
            <Typography>תפקיד: {data.userData.current_role}</Typography>
            <Box mt={2} />
            <Typography>בנק: {data.paymentData.bank_number}</Typography>
            <Typography>סניף: {data.paymentData.bank_branch}</Typography>
            <Typography>
              חשבון: {data.paymentData.bank_account_number}
            </Typography>
            <Typography>תאריך חיוב: {data.paymentData.charge_date}</Typography>
            <Typography>
              אופן תשלום: {data.paymentData.payment_method}
            </Typography>
          </Paper>
        );
      default:
        return null;
    }
  };



  return (
    <Box maxWidth={600} mx="auto" p={3}>
      <Typography variant="h5" align="center" gutterBottom>
        הוספת משתמש חדש
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}

      <Box display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          חזרה
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            המשך
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            צור משתמש
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default AddNewUser;
