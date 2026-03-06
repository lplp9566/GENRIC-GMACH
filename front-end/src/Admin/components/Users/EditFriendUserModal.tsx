import React, { FC, useState } from "react";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import { editUser, getAllUsers } from "../../../store/features/admin/adminUsersSlice";
import { IUser, IPaymentDetails } from "./UsersDto";
import { RtlThemeProvider } from "../../../Theme/rtl";

interface EditFriendUserModalProps {
  open: boolean;
  user: IUser;
  onClose: () => void;
}

const numberFieldSx = {
  "& input[type=number]": {
    MozAppearance: "textfield",
  },
  "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
    {
      WebkitAppearance: "none",
      margin: 0,
    },
};

const EditFriendUserModal: FC<EditFriendUserModalProps> = ({
  open,
  user,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<IUser>(() => user);

  const handleChange =
    (field: keyof IUser | keyof IPaymentDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSave = async () => {
    onClose();
    const promise = dispatch(
      editUser({ userId: user.id!, userData: formData })
    ) as unknown as Promise<any>;
    toast.promise(promise, {
      pending: "שומר...",
      success: "ידיד עודכן בהצלחה!",
      error: "שגיאה בעדכון הידיד",
    });
    await promise;
    await dispatch(getAllUsers({ isAdmin: false }));
  };

  return (
    <RtlThemeProvider>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            maxWidth: 560,
            width: { xs: "94vw", sm: "90vw", md: "auto" },
            maxHeight: "92vh",
            overflowY: "auto",
            direction: "rtl",
          }}
        >
          <Typography variant="h6" textAlign="center" mb={2}>
            עריכת ידיד
          </Typography>

          <Stack spacing={2}>
            <TextField
              dir="rtl"
              label="שם פרטי"
              value={formData.first_name ?? ""}
              onChange={handleChange("first_name")}
              fullWidth
            />
            <TextField
              dir="rtl"
              label="שם משפחה"
              value={formData.last_name ?? ""}
              onChange={handleChange("last_name")}
              fullWidth
            />
            <TextField
              label="תעודת זהות"
              type="number"
              dir="rtl"
              value={formData.id_number ?? ""}
              onChange={handleChange("id_number")}
              fullWidth
              sx={numberFieldSx}
            />
            <TextField
              label="אימייל"
              type="email"
              dir="rtl"
              value={formData.email_address ?? ""}
              onChange={handleChange("email_address")}
              fullWidth
            />
            <TextField
              label="טלפון"
              dir="rtl"
              value={formData.phone_number ?? ""}
              onChange={handleChange("phone_number")}
              fullWidth
            />
            <TextField
              label="שם פרטי בן/בת זוג"
              dir="rtl"
              value={formData.spouse_first_name ?? ""}
              onChange={handleChange("spouse_first_name")}
              fullWidth
            />
            <TextField
              label="שם משפחה בן/בת זוג"
              dir="rtl"
              value={formData.spouse_last_name ?? ""}
              onChange={handleChange("spouse_last_name")}
              fullWidth
            />
            <TextField
              label="תעודת זהות בן/בת זוג"
              type="number"
              dir="rtl"
              value={formData.spouse_id_number ?? ""}
              onChange={handleChange("spouse_id_number")}
              fullWidth
              sx={numberFieldSx}
            />
            <TextField
              label="תאריך לידה בן/בת זוג"
              type="date"
              dir="rtl"
              value={
                formData.spouse_birth_date
                  ? formData.spouse_birth_date instanceof Date
                    ? formData.spouse_birth_date.toISOString().slice(0, 10)
                    : String(formData.spouse_birth_date).slice(0, 10)
                  : ""
              }
              onChange={handleChange("spouse_birth_date")}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSave}>
              שמירה
            </Button>
            <Button variant="outlined" onClick={onClose}>
              ביטול
            </Button>
          </Stack>
        </Box>
      </Modal>
    </RtlThemeProvider>
  );
};

export default EditFriendUserModal;

