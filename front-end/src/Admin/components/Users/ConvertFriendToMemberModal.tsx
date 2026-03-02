import React, { FC, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch } from "../../../store/store";
import {
  editUser,
  getAllUsers,
} from "../../../store/features/admin/adminUsersSlice";
import { IUser, MembershipType, payment_method_enum } from "./UsersDto";
import { RtlThemeProvider } from "../../../Theme/rtl";
import SelectRank from "../SelectRank/SelectRank";
import StepperNavigation from "../StepperNavigation/StepperNavigation";

interface ConvertFriendToMemberModalProps {
  open: boolean;
  user: IUser;
  onClose: () => void;
}

const STEPS = ["שאר הדברים", "בן/בת זוג", "פרטי בנק", "סיכום"];

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

const ConvertFriendToMemberModal: FC<ConvertFriendToMemberModalProps> = ({
  open,
  user,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep, setActiveStep] = useState(0);

  const [bankNumber, setBankNumber] = useState<number | "">(
    user.payment_details?.bank_number ?? ""
  );
  const [bankBranch, setBankBranch] = useState<number | "">(
    user.payment_details?.bank_branch ?? ""
  );
  const [bankAccountNumber, setBankAccountNumber] = useState<number | "">(
    user.payment_details?.bank_account_number ?? ""
  );
  const [chargeDate, setChargeDate] = useState<number | "">(
    user.payment_details?.charge_date ?? ""
  );
  const [paymentMethod, setPaymentMethod] = useState<payment_method_enum>(
    user.payment_details?.payment_method ?? payment_method_enum.direct_debit
  );
  const [joinDate, setJoinDate] = useState<string>(
    user.join_date ? new Date(user.join_date).toISOString().slice(0, 10) : ""
  );
  const [permission, setPermission] = useState<
    "user" | "admin_read" | "admin_write"
  >(user.permission ?? "user");
  const [rankId, setRankId] = useState<number>(user.current_role?.id ?? 1);
  const [spouseFirstName, setSpouseFirstName] = useState<string>(
    user.spouse_first_name ?? ""
  );
  const [spouseLastName, setSpouseLastName] = useState<string>(
    user.spouse_last_name ?? ""
  );
  const [spouseIdNumber, setSpouseIdNumber] = useState<string>(
    user.spouse_id_number ?? ""
  );

  const isValid = useMemo(() => {
    const b = Number(bankNumber);
    const br = Number(bankBranch);
    const a = Number(bankAccountNumber);
    const c = Number(chargeDate);
    return (
      Number.isFinite(b) &&
      b > 0 &&
      Number.isFinite(br) &&
      br > 0 &&
      Number.isFinite(a) &&
      a > 0 &&
      Number.isFinite(c) &&
      c >= 1 &&
      c <= 28 &&
      Boolean(joinDate) &&
      Number.isFinite(rankId) &&
      rankId > 0
    );
  }, [bankNumber, bankBranch, bankAccountNumber, chargeDate, joinDate, rankId]);

  const handleClose = () => {
    setActiveStep(0);
    onClose();
  };

  const handleConvert = async () => {
    if (!isValid) return;

    handleClose();
    const promise = dispatch(
      editUser({
        userId: user.id!,
        userData: {
          ...user,
          is_member: true,
          membership_type: MembershipType.MEMBER,
          permission,
          join_date: joinDate as any,
          current_role: rankId as any,
          spouse_first_name: spouseFirstName,
          spouse_last_name: spouseLastName,
          spouse_id_number: spouseIdNumber,
          payment_details: {
            ...user.payment_details,
            bank_number: Number(bankNumber),
            bank_branch: Number(bankBranch),
            bank_account_number: Number(bankAccountNumber),
            charge_date: Number(chargeDate),
            payment_method: paymentMethod,
          },
        },
      })
    ) as unknown as Promise<any>;

    toast.promise(promise, {
      pending: "מעדכן משתמש...",
      success: "הידיד הומר למשתמש בהצלחה",
      error: "המרת הידיד למשתמש נכשלה",
    });

    await promise;
    await dispatch(getAllUsers({ isAdmin: false }));
  };

  const renderCurrentStep = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={2}>
          <TextField
            label="תאריך הצטרפות"
            type="date"
            dir="rtl"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>הרשאה</InputLabel>
            <Select
              value={permission}
              label="הרשאה"
              onChange={(e: SelectChangeEvent) =>
                setPermission(
                  e.target.value as "user" | "admin_read" | "admin_write"
                )
              }
            >
              <MenuItem value="user">משתמש</MenuItem>
              <MenuItem value="admin_read">מנהל צפייה</MenuItem>
              <MenuItem value="admin_write">מנהל עריכה</MenuItem>
            </Select>
          </FormControl>
          <SelectRank value={rankId} onChange={setRankId} label="דרגה" />
          <TextField
            label="יום חיוב (1-28)"
            type="number"
            dir="rtl"
            value={chargeDate}
            onChange={(e) => setChargeDate(Number(e.target.value))}
            fullWidth
            sx={numberFieldSx}
          />
          <FormControl fullWidth>
            <InputLabel>אמצעי חיוב</InputLabel>
            <Select
              value={paymentMethod}
              label="אמצעי חיוב"
              onChange={(e: SelectChangeEvent) =>
                setPaymentMethod(e.target.value as payment_method_enum)
              }
            >
              <MenuItem value={payment_method_enum.direct_debit}>
                הוראת קבע
              </MenuItem>
              <MenuItem value={payment_method_enum.credit_card}>
                כרטיס אשראי
              </MenuItem>
              <MenuItem value={payment_method_enum.bank_transfer}>
                העברה בנקאית
              </MenuItem>
              <MenuItem value={payment_method_enum.cash}>מזומן</MenuItem>
              <MenuItem value={payment_method_enum.other}>אחר</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={2}>
          <TextField
            label="שם פרטי בן/בת זוג"
            dir="rtl"
            value={spouseFirstName}
            onChange={(e) => setSpouseFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="שם משפחה בן/בת זוג"
            dir="rtl"
            value={spouseLastName}
            onChange={(e) => setSpouseLastName(e.target.value)}
            fullWidth
          />
          <TextField
            label="תעודת זהות בן/בת זוג"
            type="number"
            dir="rtl"
            value={spouseIdNumber}
            onChange={(e) => setSpouseIdNumber(e.target.value)}
            fullWidth
            sx={numberFieldSx}
          />
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={2}>
          <TextField
            label="מספר בנק"
            type="number"
            dir="rtl"
            value={bankNumber}
            onChange={(e) => setBankNumber(Number(e.target.value))}
            fullWidth
            sx={numberFieldSx}
          />
          <TextField
            label="סניף"
            type="number"
            dir="rtl"
            value={bankBranch}
            onChange={(e) => setBankBranch(Number(e.target.value))}
            fullWidth
            sx={numberFieldSx}
          />
          <TextField
            label="מספר חשבון"
            type="number"
            dir="rtl"
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(Number(e.target.value))}
            fullWidth
            sx={numberFieldSx}
          />
        </Stack>
      );
    }

    return (
      <Stack spacing={1.5}>
        <Typography>
          <strong>תאריך הצטרפות:</strong> {joinDate || "-"}
        </Typography>
        <Typography>
          <strong>הרשאה:</strong>{" "}
          {permission === "admin_write"
            ? "מנהל עריכה"
            : permission === "admin_read"
            ? "מנהל צפייה"
            : "משתמש"}
        </Typography>
        <Typography>
          <strong>דרגה:</strong> #{rankId}
        </Typography>
        <Typography>
          <strong>יום חיוב:</strong> {chargeDate || "-"}
        </Typography>
        <Typography>
          <strong>בנק/סניף/חשבון:</strong> {bankNumber || "-"} /{" "}
          {bankBranch || "-"} / {bankAccountNumber || "-"}
        </Typography>
        <Typography>
          <strong>בן/בת זוג:</strong>{" "}
          {[spouseFirstName, spouseLastName].filter(Boolean).join(" ") || "-"}
        </Typography>
      </Stack>
    );
  };

  return (
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
            minWidth: 360,
            maxWidth: 640,
            width: "92%",
            direction: "rtl",
          }}
        >
          <Typography variant="h6" textAlign="center" mb={2}>
            השלמת פרטים והפיכה למשתמש
          </Typography>

          <StepperNavigation steps={STEPS} activeStep={activeStep} />

          {renderCurrentStep()}

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={handleClose}>
              ביטול
            </Button>

            <Stack direction="row" spacing={1}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  חזור
                </Button>
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  הבא
                </Button>
              ) : (
                <Button
                  variant="contained"
                  disabled={!isValid}
                  onClick={handleConvert}
                >
                  הפוך למשתמש
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </RtlThemeProvider>
  );
};

export default ConvertFriendToMemberModal;
