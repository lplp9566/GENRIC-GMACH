import  { FC, useState } from 'react'
import { DepositActionsType } from '../depositsDto';
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import DepositAmountChange from './DepositAmountChange';
interface IDepositsActionsProps {
    depositId: number;
    max:number
}
const DepositsActions:FC<IDepositsActionsProps> = ({ depositId, max }) => {
    const [mode ,setMode ] =useState<DepositActionsType>(DepositActionsType.AddToDeposit)
    const handleModeChange = (e: SelectChangeEvent) => {
        setMode(e.target.value as DepositActionsType);
    };
console.log(max);

  return (
  <Box dir="rtl">
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: "#FEFEFE"}}>
        <Typography variant="h6" sx={{textAlign:"center", paddingBottom:2}}>פעולות להלוואה</Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="action-select-label">בחר פעולה</InputLabel>
          <Select
            labelId="action-select-label"
            value={mode}
            label="בחר פעולה"
            onChange={handleModeChange}
            sx={{ backgroundColor: "#FFF", borderRadius: 1 }}
          >
            <MenuItem value={DepositActionsType.AddToDeposit}>הוספה  להפקדה </MenuItem>
            <MenuItem value={DepositActionsType.ChangeReturnDate}>
              שינוי סכום הפקדה
            </MenuItem>
            <MenuItem value={DepositActionsType.RemoveFromDeposit}>
              הסרה מהפקדה
            </MenuItem>
          </Select>
        </FormControl>

        {mode === DepositActionsType.AddToDeposit && (
<DepositAmountChange depositId={depositId}/>
        )}
        {/* {mode === LoanPaymentActionType.AMOUNT_CHANGE && (
          <AmountChangeLoanForm loanId={loanId} onSubmit={handleSubmit} />
        )}
        {mode === LoanPaymentActionType.MONTHLY_PAYMENT_CHANGE && (
          <MonthlyPaymentChangeLoanForm loanId={loanId} onSubmit={handleSubmit} />
        )} */}
      
      </Paper>
    </Box>  )
}

export default DepositsActions