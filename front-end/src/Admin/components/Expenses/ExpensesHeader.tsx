import { Paper, Stack, Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import AddExpensesCategoryModal from "./AddExpensesCategoryModal";
import AddExpenseModal from "./AddExpenseModal";
import { RootState } from "../../../store/store";

// TODO: שנה נתיבים/שמות לפי הקומפוננטות אצלך
// import AddExpenseModal from "./AddExpenseModal";
// import AddExpensesCategoryModal from "./AddExpensesCategoryModal";

const ExpensesHeader = () => {
  const [openAddExpense, setOpenAddExpense] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const authUser = useSelector((s: RootState) => s.authslice.user);
  const permission = authUser?.permission ?? authUser?.user?.permission;
  const canWrite = Boolean(authUser?.is_admin || permission === "admin_write");

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        width: { xs: "100%", sm: "90%", md: "60%", lg: "40%" },
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
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          {canWrite && (
            <Button
            variant="contained"
            onClick={() => setOpenAddExpense(true)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: "rgb(26, 29, 27)",
              },
            }}
          >
            הוסף הוצאה
          </Button>
          )}

          {canWrite && (
            <Button
            variant="outlined"
            onClick={() => setOpenAddCategory(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            הוסף קטגוריה
          </Button>
          )}
        </Box>
      </Stack>

      {canWrite && openAddExpense && (
        <AddExpenseModal
          open={openAddExpense}
          onClose={() => setOpenAddExpense(false)}
        />
      )}

      {canWrite && openAddCategory && (
        <AddExpensesCategoryModal
          open={openAddCategory}
          onClose={() => setOpenAddCategory(false)}
        />
      )}
    </Paper>
  );
};

export default ExpensesHeader;
