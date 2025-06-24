// src/hooks/useLoanSubmit.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { ICreateLoanAction } from "../../components/Loans/LoanDto";
import { createLoanAction, getLoanDetails } from "../../../store/features/admin/adminLoanSlice";


const useLoanSubmit =(loanId: number) =>{
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = useCallback(
    async (dto: ICreateLoanAction) => {
      // 1) שליחת העדכון/יצירה
      await dispatch(createLoanAction(dto)).unwrap();
      // 2) רענון הפרטים עם ה־id הנוכחי
      await dispatch(getLoanDetails(loanId)).unwrap();
    },
    [dispatch, loanId]
  );

  return handleSubmit;
}
export default useLoanSubmit