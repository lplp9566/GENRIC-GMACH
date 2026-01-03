import { Paper, Stack, Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import AddExpensesCategoryModal from "./AddExpensesCategoryModal";
import AddExpenseModal from "./AddExpenseModal";

// TODO: שנה נתיבים/שמות לפי הקומפוננטות אצלך
// import AddExpenseModal from "./AddExpenseModal";
// import AddExpensesCategoryModal from "./AddExpensesCategoryModal";

const ExpensesHeader = () => {
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        width: "40%",
        mx: "auto",
        dir: "rtl",
      }}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="h5" align="center" fontWeight={600}>
            ניהול הוצאות
          </Typography>

          <img
            width="48"
            height="48"
            src="https://img.icons8.com/fluency/48/receipt.png"
            alt="expenses"
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpenAddExpense(true)}
            sx={{
              "&:hover": {
                backgroundColor: "rgb(26, 29, 27)",
              },
            }}
          >
            הוסף הוצאה
          </Button>

          <Button
            variant="outlined"
            onClick={() => setOpenAddCategory(true)}
          >
            הוסף קטגוריה
          </Button>
        </Box>
      </Stack>

      {openAddExpense && (
        <AddExpenseModal
          open={openAddExpense}
          onClose={() => setOpenAddExpense(false)}
        />
      )}

      {openAddCategory && (
        <AddExpensesCategoryModal
          open={openAddCategory}
          onClose={() => setOpenAddCategory(false)}
        />
      )}
    </Paper>
  );
};

export default ExpensesHeader;
