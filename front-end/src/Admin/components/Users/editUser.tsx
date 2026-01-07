// editUser.tsx
import React, { FC, useState } from "react";
import StepperNavigation from "../StepperNavigation/StepperNavigation";
import { IPaymentDetails, IUser } from "./UsersDto";
import {
  Modal,
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { AppDispatch } from "../../../store/store";
import { useDispatch } from "react-redux";
import {
  editUser,
  getAllUsers,
} from "../../../store/features/admin/adminUsersSlice";
import { toast } from "react-toastify";
import { RtlThemeProvider } from "../../../Theme/rtl";
import { SelectChangeEvent } from "@mui/material";

interface EditUserProps {
  open: boolean;
  user: IUser;
  onClose: () => void;
}

const EditUser: FC<EditUserProps> = ({ user, open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<IUser>(() => user);
  const handleChange =
    (field: keyof IUser | keyof IPaymentDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };
  const handlePaymentChange =
    (field: keyof IPaymentDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        payment_details: {
          ...prev.payment_details,
          [field]: event.target.value,
        },
      }));
    };
  const handleMemberChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      is_member: event.target.value === "true",
    }));
  };

  const handleNext = () => {
    if (activeStep < 2) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleSave = async () => {
    const promise = dispatch(
      editUser({ userId: user.id!, userData: formData })
    ) as unknown as Promise<any>;
    toast.promise(promise, {
      pending: "מעדכן...",
      success: "המשתמש עודכן בהצלחה! 👌",
      error: "אירעה שגיאה בעדכון המשתמש 💥",
    });
    await promise;
    await dispatch(getAllUsers({ isAdmin: false }));

    onClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  return (
    // <RtlProvider>
    <RtlThemeProvider>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            minWidth: 400,
            maxWidth: 600,
          }}
        >
          <StepperNavigation
            steps={["פרטים אישיים", "פרטי חשבון", "סיכום ואישור"]}
            activeStep={activeStep}
          />

          <Box sx={{ mt: 3 }}>
            {activeStep === 0 && (
              <Stack spacing={2}>
                <Typography variant="h6" textAlign={"center"}>
                  פרטים אישיים
                </Typography>
                <Box>
                  <TextField
                    dir="rtl"
                    label="שם משפחה"
                    value={formData.last_name ?? ""}
                    onChange={handleChange("last_name")}
                    sx={{ width: "49.5%", marginLeft: "2px" }}
                  />
                  <TextField
                    dir="rtl"
                    label="שם פרטי"
                    value={formData.first_name ?? ""}
                    onChange={handleChange("first_name")}
                    sx={{ width: "49.5%" }}
                  />
                  <Select
                    dir="rtl"
                    value={String(!!formData.is_member)}
                    onChange={handleMemberChange}
                  sx={{ width: "49.5%", marginLeft: "2px",marginTop:2 }}
                  >
                    <MenuItem value="true">חבר גמ"ח</MenuItem>
                    <MenuItem value="false">לא חבר גמ"ח</MenuItem>
                  </Select>
                <TextField
                  label="אימייל"
                  type="email"
                  dir="rtl"
                  value={formData.email_address ?? ""}
                  onChange={handleChange("email_address")}
                  fullWidth
                  sx={{ width: "49.5%", marginLeft: "2px",marginTop:2 }}
                />

                <TextField
                  label="טלפון"
                  dir="rtl"
                  value={formData.phone_number ?? ""}
                  onChange={handleChange("phone_number")}
                  fullWidth
                  sx={{ width: "49.5%", marginLeft: "2px",marginTop:2 }}
                />
                <TextField
                  label="תעודת זהות "
                  dir="rtl"
                  value={formData.id_number ?? ""}
                  onChange={handleChange("id_number")}
                  fullWidth
                  sx={{ width: "49.5%", marginLeft: "2px",marginTop:2 }}
                />
                              </Box>
              </Stack>

            )}

            {activeStep === 1 && (
              <Stack spacing={2}>
                <Typography variant="h6" textAlign={"center"}>
                  {" "}
                  פרטי חשבון בנק{" "}
                </Typography>
                <TextField
                  label="מספר בנק"
                  dir="rtl"
                  value={formData.payment_details.bank_number ?? ""}
                  onChange={handlePaymentChange("bank_number")}
                  fullWidth
                />
                <TextField
                  label="סניף"
                  dir="rtl"
                  value={formData.payment_details.bank_branch ?? ""}
                  onChange={handlePaymentChange("bank_branch")}
                  fullWidth
                />
                <TextField
                  label="מספר חשבון"
                  dir="rtl"
                  value={formData.payment_details.bank_account_number ?? ""}
                  onChange={handlePaymentChange("bank_account_number")}
                  fullWidth
                />
                <TextField
                  label="תאריך חיוב"
                  dir="rtl"
                  value={formData.payment_details.charge_date ?? ""}
                  onChange={handlePaymentChange("charge_date")}
                  fullWidth
                />
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={1}>
                <Typography variant="h6">סיכום ואישור</Typography>
                <Typography>שם פרטי: {formData.first_name}</Typography>
                <Typography>שם משפחה: {formData.last_name}</Typography>
                <Typography>אימייל: {formData.email_address}</Typography>
                <Typography>טלפון: {formData.phone_number}</Typography>
              </Stack>
            )}
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            {activeStep < 2 ? (
              <Button variant="contained" onClick={handleNext}>
                הבא
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSave}>
                שמירה
              </Button>
            )}
            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button variant="outlined" onClick={handleBack}>
                  הקודם
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </RtlThemeProvider>
  );
};

export default EditUser;
