import { Typography } from "@mui/material";


interface Props {
  loanId: number;
}

const Actions: React.FC<Props> = ({ loanId }) => {
    console.log(loanId)
//   const dispatch = useDispatch<AppDispatch>();
//   const [isLoading, setLoading] = useState(false);

//   const handleAddAction = async () => {
//     setLoading(true);
//     try {
//       await dispatch(
//         createLoanAction({
//           action_type: LoanPaymentActionType.AMOUNT_CHANGE,
//           value: 100,
//           date: new Date().toISOString(),
//           loanId,
//         })
//       ).unwrap();
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    // <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    //   <Button
    //     variant="contained"
    //     onClick={handleAddAction}
    //     disabled={isLoading}
    //   >
    //     הוסף שינוי סכום (+₪100)
    //   </Button>

    //   {/* אפשר להוסיף כאן כפתורים נוספים לסוגי פעולות אחרים */}
    // </Box>
    <Typography>כאן  תוכל לעשות את כל הפעילות על ההלואאה </Typography>
  );
};

export default Actions;
