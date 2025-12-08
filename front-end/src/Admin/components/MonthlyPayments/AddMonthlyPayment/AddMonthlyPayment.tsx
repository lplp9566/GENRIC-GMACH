// src/components/AddPaymentModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { setMonthlyPaymentModalMode } from "../../../../store/features/Main/AppMode";
import { paymentMethod } from "../MonthlyPaymentsDto";
import SelectAllUsers from "../../SelectUsers/SelectAllUsers";
import { createMonthlyPayment, gatAllMonthlyPayments, getMonthlyPaymentsByUserId } from "../../../../store/features/admin/adminMonthlyPayments";
import { payment_method_enum } from "../../Users/UsersDto";
import { toast } from "react-toastify";
import { RtlProvider } from "../../../../Theme/rtl";

export const AddPaymentModal: React.FC = () => {
  const open = useSelector(
    (s: RootState) => s.mapModeSlice.MonthlyPaymentModalMode
  );
  const dispatch = useDispatch<AppDispatch>();
  const today = new Date().toISOString().slice(0, 10);

  const [isMultiUser, setIsMultiUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [tempMultiUserId, setTempMultiUserId] = useState<number | null>(null);
  const [newPayment, setNewPayment] = useState<{
    userId: number;
    amount: number;
    depositDate: string;
    method: payment_method_enum;
    description: string;
  }>({
    userId: 0,
    amount: 0,
    depositDate: today,
    method: paymentMethod[0].value as payment_method_enum,
    description: "",
  });

  const handleClose = () => {
    dispatch(setMonthlyPaymentModalMode(false));
  };
    const allUsers = useSelector(
      (state: RootState) => state.AdminUsers.allUsers
    );
  const selectedUser = useSelector(
    (state: RootState) => state.AdminUsers.selectedUser
  );
  const handleAddMultiUser = () => {
    if (!tempMultiUserId || tempMultiUserId === 0) return;
    setSelectedUsers((prev) =>
      prev.includes(tempMultiUserId) ? prev : [...prev, tempMultiUserId]
    );
  };

  const handleRemoveMultiUser = (id: number) => {
    setSelectedUsers((prev) => prev.filter((uid) => uid !== id));
  };

  const handleSubmit = () => {
            handleClose();
    const targetUserIds = isMultiUser
      ? selectedUsers
      : [newPayment.userId];

    const basePayload = {
      amount: newPayment.amount,
      deposit_date: newPayment.depositDate,
      payment_method: newPayment.method,
      description: newPayment.description,
    };

    const allPromises = Promise.all(
      targetUserIds.map((userId) =>
        dispatch(
          createMonthlyPayment({
            ...basePayload,
            user: userId,
          })
        ).unwrap()
      )
    );

    toast.promise(
      allPromises,
      {
        pending:isMultiUser
          ? `מוסיף תשלום של ${newPayment.amount} ש"ח ל־${targetUserIds.length} משתמשים...`
          : `מוסיף תשלום של ${newPayment.amount} ש"ח...`,
        success: isMultiUser
          ? `הוספת תשלום של ${newPayment.amount} ש"ח ל־${targetUserIds.length} משתמשים בוצעה בהצלחה`
          : `הוספת תשלום של ${newPayment.amount} ש"ח בוצעה בהצלחה`,
        error: "שגיאה בהוספת התשלום 💥",
      },
      { autoClose: 3000 }
    );

    allPromises
      .then(() => {
    if (selectedUser) {
          dispatch(getMonthlyPaymentsByUserId(selectedUser.id));
        }
        else{
        dispatch(gatAllMonthlyPayments());
        }
      })
      .catch(() => {
        toast.error("שגיאה בהוספת התשלום 💥", { autoClose: 3000 });
      });
  };

  const isSubmitDisabled =
    newPayment.amount <= 0 ||
    !newPayment.method ||
    (!isMultiUser && newPayment.userId === 0) ||
    (isMultiUser && selectedUsers.length === 0);

  return (
    <RtlProvider>
      <Dialog
        open={!!open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 12px 30px rgba(0,0,0,0.16)",
            bgcolor: "#e8f5e9",
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            bgcolor: "green",
            color: "#fff",
            py: 2.5,
            textAlign: "center",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, m: 0 }}>
            הוספת תשלום דמי חבר 
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 4, pt: 3, pb: 2 }}>
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 3,
              border: "1px solid #c8e6c9",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isMultiUser}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsMultiUser(checked);
                    if (!checked) {
                      setSelectedUsers([]);
                    }
                  }}
                  color="success"
                />
              }
              label={
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                  מצב בחירה:{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {isMultiUser ? "משתמשים מרובים" : "משתמש יחיד"}
                  </Box>
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #c8e6c9",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                בחירת משתמשים
              </Typography>

              {!isMultiUser && (
                <SelectAllUsers
                  value={newPayment.userId}
                  onChange={(id) =>
                    setNewPayment((p) => ({
                      ...p,
                      userId: id,
                    }))
                  }
                  label="בחר משתמש*"
                  color="success"
                />
              )}

              {isMultiUser && (
                <>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <SelectAllUsers
                        value={tempMultiUserId ?? 0}
                        onChange={(id) => setTempMultiUserId(id)}
                        label="בחר משתמש להוספה*"
                        color="success"
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={handleAddMultiUser}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      הוסף לרשימה
                    </Button>
                  </Stack>

                  {selectedUsers.length > 0 && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, color: "text.secondary" }}
                      >
                        משתמשים שנבחרו:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {selectedUsers.map((id) => (
                          <Chip
                            key={id}
                            label={`${allUsers.find((u) => u.id === id)?.first_name} ${allUsers.find((u) => u.id === id)?.last_name}`}
                            onDelete={() => handleRemoveMultiUser(id)}
                            color="success"
                            variant="outlined"
                            sx={{ borderRadius: 999 }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}
                </>
              )}
            </Box>
            <TextField
              label="סכום (₪)*"
              size="medium"
              color="success"
              fullWidth
              inputProps={{ min: 0 }}
              value={newPayment.amount}
              onChange={(e) =>
                setNewPayment((p) => ({
                  ...p,
                  amount: +e.target.value,
                }))
              }
            />


            <TextField
              label="תאריך*"
              type="date"
              size="medium"
              fullWidth
              color="success"
              InputLabelProps={{ shrink: true }}
              value={newPayment.depositDate}
              onChange={(e) =>
                setNewPayment((p) => ({
                  ...p,
                  depositDate: e.target.value,
                }))
              }
            />

            {/* אמצעי תשלום */}
            <FormControl fullWidth size="medium">
              <InputLabel
                id="method-label"
                sx={{
                  color: "success.main",
                  "&.Mui-focused": { color: "success.dark" },
                }}
              >
                אמצעי תשלום*
              </InputLabel>
              <Select
                labelId="method-label"
                value={newPayment.method}
                label="אמצעי תשלום*"
                color="success"
                onChange={(e) =>
                  setNewPayment((p) => ({
                    ...p,
                    method: e.target.value as payment_method_enum,
                  }))
                }
              >
                {paymentMethod.map((pm) => (
                  <MenuItem key={pm.value} value={pm.value} dir="rtl">
                    {pm.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* הערות */}
            <TextField
              label="הערות"
              size="small"
              fullWidth
              color="success"
              multiline
              minRows={3}
              value={newPayment.description}
              onChange={(e) =>
                setNewPayment((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            pb: 3,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            sx={{
              bgcolor: "green",
              color: "#fff",
              px: 3,
              py: 1,
              borderRadius: 2,
              "&:hover": { bgcolor: "#115293" },
            }}
          >
            {isMultiUser ? "הוסף הוראת קבע למספר משתמשים" : "הוסף הוראת קבע"}
          </Button>
          <Button onClick={handleClose}>ביטול</Button>
        </DialogActions>
      </Dialog>
    </RtlProvider>
  );
};
