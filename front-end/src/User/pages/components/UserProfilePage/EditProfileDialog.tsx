import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { RtlThemeProvider } from "../../../../Theme/rtl";
import { ProfileFormData } from "./types";
type Props = {
  open: boolean;
  formData: ProfileFormData;
  onClose: () => void;
  onSave: () => void;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
};

const EditProfileDialog = ({
  open,
  formData,
  onClose,
  onSave,
  setFormData,
}: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ textAlign: "center" }}>עריכת פרטים אישיים</DialogTitle>
    <DialogContent sx={{ direction: "rtl" }}>
      <RtlThemeProvider>
        <Stack
          spacing={2}
          mt={1}
        
        >
          <TextField
            label="שם פרטי"
            value={formData.first_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, first_name: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="שם משפחה"
            value={formData.last_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, last_name: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="אימייל"
            value={formData.email_address}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email_address: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="טלפון"
            value={formData.phone_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="מספר זהות"
            value={formData.id_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, id_number: e.target.value }))
            }
            fullWidth
          />

          <Divider />

          <TextField
            label="שם פרטי בן/בת זוג"
            value={formData.spouse_first_name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                spouse_first_name: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="שם משפחה בן/בת זוג"
            value={formData.spouse_last_name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                spouse_last_name: e.target.value,
              }))
            }
            fullWidth
          />
          <TextField
            label="תעודת זהות בן/בת זוג"
            value={formData.spouse_id_number}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                spouse_id_number: e.target.value,
              }))
            }
            fullWidth
          />

          <Divider />

          <TextField
            label="מספר בנק"
            value={formData.bank_number}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bank_number: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="מספר סניף"
            value={formData.bank_branch}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bank_branch: e.target.value }))
            }
            fullWidth
          />
          <TextField
            label="מספר חשבון"
            value={formData.bank_account_number}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                bank_account_number: e.target.value,
              }))
            }
            fullWidth
          />
        </Stack>
      </RtlThemeProvider>
    </DialogContent>
    <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
      <Button onClick={onSave} variant="contained">
        שמירה
      </Button>
      <Button onClick={onClose} variant="outlined">
        ביטול
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditProfileDialog;
