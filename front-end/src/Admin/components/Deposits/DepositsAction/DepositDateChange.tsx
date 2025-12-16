import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { DepositActionsType, IDepositActionCreate } from "../depositsDto";
import { toast } from "react-toastify";
import BringForwardModal from "./DepositCheckModal";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";
import { trackEvent } from "../../../trackEvent";

interface DepositDateChangeProps {
  depositId: number;
  handleSubmit?: (dto: IDepositActionCreate) => Promise<void>;
}
const DepositDateChange: React.FC<DepositDateChangeProps> = ({
  depositId,
  handleSubmit,
}) => {
  const [date, setDate] = useState<string>("");
  const [isModalOpen ,setIsModalOpen]= useState<boolean>(false)
  const [updateDate, setUpdateDate] = useState<string>("");
  const isValid = date !== "" && updateDate !== "";
    const deposit = useSelector((s: RootState) => s.AdminDepositsSlice.currentDeposit);

  const handle = async()=>{
    if(!isValid) return;
    if(new Date(updateDate)> new Date(deposit?.end_date ||"") ){
    
    approve()
    return  

    }
    setIsModalOpen(true)
  }
  const approve = async () => {
    if (!isValid) return;
    const dto: IDepositActionCreate = {
      deposit: depositId,
      action_type: DepositActionsType.ChangeReturnDate,
      date,
      update_date: updateDate,
    };
    try {
      if (!handleSubmit) throw new Error("לא הוגדרה פונקציית שליחה");
      await toast.promise(
        handleSubmit(dto),
        {
          pending: "שולח...",
          success: `התאריך עודכן בהצלחה ל ${new Date(updateDate).toLocaleDateString("he-IL")}`,
          error: "אירעה שגיאה בשמירת הפעולה",
        }
      )
      setDate("")
      setUpdateDate("")
      trackEvent("הפקדות", "עדכון", "תאריך החדש", depositId);
    } catch (err: any) {
      toast.error(err?.message ?? "אירעה שגיאה בשמירת הפעולה");
    }
    // Here you would typically dispatch an action or call an API to update the deposit date
  };
  return (
<Box>
  {isModalOpen&& <BringForwardModal depositId={depositId} handleSubmit={approve} newReturnDate={updateDate} onClose={()=>setIsModalOpen(false)} open/> }

    <Box
      component="form"
      noValidate
      autoCapitalize="off"
      sx={{
        mt: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handle();
      }}
    >
      <TextField
        fullWidth
        label="תאריך הפעולה"
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
        }}
        size="small"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="התאריך החדש"
        value={updateDate}
        fullWidth
        type="date"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => {
          setUpdateDate(e.target.value);
        }}
        size="small"
        // sx={{ minWidth: 120 }}
      />
      <Button
        sx={{ bgcolor: isValid ? "#113E21" : "grey.500" }}
        fullWidth
        type="submit"
        variant="contained"
        disabled={!isValid}
      >
        שלח
      </Button>
    </Box>
    </Box>
  );
};

export default DepositDateChange;
