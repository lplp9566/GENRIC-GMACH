
import { useDispatch, useSelector } from 'react-redux';
import Loans from '../components/Loans/Loans'
import { AppDispatch, RootState } from '../store/store';
import { useEffect } from 'react';
import { getAllLoans } from '../store/features/admin/adminLoanSlice';
import { ILoan } from '../components/Loans/LoanDto';
const LoansPage = () => {

    const dispatch = useDispatch<AppDispatch>();
    const { allLoans } = useSelector(
      (state: RootState) => state.adminLoansSlice
    );
  const loansData:ILoan[] = Array.isArray(allLoans) ? allLoans : [];

    useEffect(() => {
    dispatch(getAllLoans());
  }, [dispatch]);

  useEffect(() => {
  }, [allLoans]);
  return (
  <Loans loansData={loansData}/>
  );
};

export default LoansPage;


