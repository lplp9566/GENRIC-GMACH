import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IExpenses,
  IExpensesCategory,
} from "../../../Admin/components/Expenses/dto";
import { Status } from "../../../Admin/components/Users/UsersDto";
import { api } from "../../axiosInstance";

interface AdminExpensesType {
  allExpenses: IExpenses[] | [];
  allExpensesCategory: IExpensesCategory[];
  createExpensesCategoryStatus: Status;
  createExpensesStatus: Status;
  getAllExpensesStatus: Status;
  getAllExpensesCategoryStatus: Status;
  updateExpensesCategoryStatus: Status;
  updateExpensesStatus: Status;
  delateExpensesCategoryStatus: Status;
  delateExpensesStatus: Status;
  error?: string | null;
}

const initialState: AdminExpensesType = {
  allExpenses: [],
  allExpensesCategory: [],
  createExpensesCategoryStatus: "idle",
  createExpensesStatus: "idle",
  delateExpensesCategoryStatus: "idle",
  delateExpensesStatus: "idle",
  getAllExpensesCategoryStatus: "idle",
  getAllExpensesStatus: "idle",
  updateExpensesCategoryStatus: "idle",
  updateExpensesStatus: "idle",
  error: null,
};

export const getAllExpenses = createAsyncThunk<IExpenses[]>(
  "admin/getAllExpenses",
  async () => {
    const { data } = await api.get<IExpenses[]>(`/expenses`);
    return data;
  }
);

export const createExpense = createAsyncThunk<IExpenses, Partial<IExpenses>>(
  "admin/createExpense",
  async (expense) => {
    const { data } = await api.post<IExpenses>(`/expenses`, expense);
    return data;
  }
);

// GET /expenses/:id (אם תרצה שימוש נקודתי)
export const getExpenseById = createAsyncThunk<IExpenses, number>(
  "admin/getExpenseById",
  async (id) => {
    const { data } = await api.get<IExpenses>(`/expenses/${id}`);
    return data;
  }
);

// DELETE /expenses/:id
export const deleteExpenseById = createAsyncThunk<number, number>(
  "admin/deleteExpenseById",
  async (id) => {
    await api.delete(`/expenses/${id}`);
    return id; // נחזיר id כדי למחוק מהסטייט
  }
);

export const updateExpenseById = createAsyncThunk<
  IExpenses,
  Partial<IExpenses> & { id: number }
>("admin/updateExpenseById", async (expense) => {
  const { data } = await api.patch<IExpenses>(
    `/expenses/${expense.id}`,
    expense
  );
  return data;
});

export const CreateExpensesCategory = createAsyncThunk<
  IExpensesCategory,
  Partial<IExpensesCategory>
>("admin/CreateExpensesCategory", async (category) => {
  const { data } = await api.post<IExpensesCategory>(
    `/expenses-category`,
    category
  );
  return data;
});

// GET /expenses-category
export const getAllExpensesCategory = createAsyncThunk<IExpensesCategory[]>(
  "admin/getAllExpensesCategory",
  async () => {
    const { data } = await api.get<IExpensesCategory[]>(`/expenses-category`);
    return data;
  }
);

// GET /expenses-category/:id
export const getExpensesCategoryById = createAsyncThunk<
  IExpensesCategory,
  number
>("admin/getExpensesCategoryById", async (id) => {
  const { data } = await api.get<IExpensesCategory>(`/expenses-category/${id}`);
  return data;
});

export const updateExpensesCategoryById = createAsyncThunk<
  IExpensesCategory,
  { id: number; name: string }
>("admin/updateExpensesCategoryById", async (payload) => {
  const { data } = await api.patch<IExpensesCategory>(
    `/expenses-category/${payload.id}`,
    { name: payload.name }
  );
  return data;
});

export const deleteExpensesCategoryById = createAsyncThunk<number, number>(
  "admin/deleteExpensesCategoryById",
  async (id) => {
    await api.delete(`/expenses-category/${id}`);
    return id;
  }
);

export const AdminExpensesSlice = createSlice({
  name: "adminExpenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* -------- Expenses -------- */
      .addCase(getAllExpenses.pending, (state) => {
        state.getAllExpensesStatus = "pending";
        state.error = null;
      })
      .addCase(getAllExpenses.fulfilled, (state, action) => {
        state.getAllExpensesStatus = "fulfilled";
        state.allExpenses = action.payload;
      })
      .addCase(getAllExpenses.rejected, (state, action) => {
        state.getAllExpensesStatus = "rejected";
        state.error = action.error.message ?? "Failed to fetch expenses";
      })

      .addCase(createExpense.pending, (state) => {
        state.createExpensesStatus = "pending";
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.createExpensesStatus = "fulfilled";
        (state.allExpenses as IExpenses[]).unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.createExpensesStatus = "rejected";
        state.error = action.error.message ?? "Failed to create expense";
      })

      .addCase(deleteExpenseById.pending, (state) => {
        state.delateExpensesStatus = "pending";
        state.error = null;
      })
      .addCase(deleteExpenseById.fulfilled, (state, action) => {
        state.delateExpensesStatus = "fulfilled";
        const id = action.payload;
        state.allExpenses = (state.allExpenses as IExpenses[]).filter(
          (e) => (e as any).id !== id
        );
      })
      .addCase(deleteExpenseById.rejected, (state, action) => {
        state.delateExpensesStatus = "rejected";
        state.error = action.error.message ?? "Failed to delete expense";
      })

      .addCase(getExpenseById.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to fetch expense";
      })
      .addCase(updateExpenseById.pending, (state) => {
        state.updateExpensesStatus = "pending";
        state.error = null;
      })
      .addCase(updateExpenseById.fulfilled, (state, action) => {
        state.updateExpensesStatus = "fulfilled";
        const updated = action.payload;
        const index = (state.allExpenses as IExpenses[]).findIndex(
          (e: any) => e.id === (updated as any).id
        );
        if (index !== -1) {
          (state.allExpenses as IExpenses[])[index] = updated;
        }
      })
      .addCase(updateExpenseById.rejected, (state, action) => {
        state.updateExpensesStatus = "rejected";
        state.error = action.error.message ?? "Failed to update expense";
      })

      /* -------- Categories -------- */
      .addCase(getAllExpensesCategory.pending, (state) => {
        state.getAllExpensesCategoryStatus = "pending";
        state.error = null;
      })
      .addCase(getAllExpensesCategory.fulfilled, (state, action) => {
        state.getAllExpensesCategoryStatus = "fulfilled";
        state.allExpensesCategory = action.payload;
      })
      .addCase(getAllExpensesCategory.rejected, (state, action) => {
        state.getAllExpensesCategoryStatus = "rejected";
        state.error = action.error.message ?? "Failed to fetch categories";
      })

      .addCase(CreateExpensesCategory.pending, (state) => {
        state.createExpensesCategoryStatus = "pending";
        state.error = null;
      })
      .addCase(CreateExpensesCategory.fulfilled, (state, action) => {
        state.createExpensesCategoryStatus = "fulfilled";
        const prev = Array.isArray(state.allExpensesCategory)
          ? state.allExpensesCategory
          : [];

        state.allExpensesCategory = [...prev, action.payload];
      })
      .addCase(CreateExpensesCategory.rejected, (state, action) => {
        state.createExpensesCategoryStatus = "rejected";
        state.error = action.error.message ?? "Failed to create category";
      })

      .addCase(updateExpensesCategoryById.pending, (state) => {
        state.updateExpensesCategoryStatus = "pending";
        state.error = null;
      })
      .addCase(updateExpensesCategoryById.fulfilled, (state, action) => {
        state.updateExpensesCategoryStatus = "fulfilled";
        const updated = action.payload;
        const index = (
          state.allExpensesCategory as IExpensesCategory[]
        ).findIndex((c: any) => c.id === (updated as any).id);
        if (index !== -1) {
          (state.allExpensesCategory as IExpensesCategory[])[index] = updated;
        }
      })
      .addCase(updateExpensesCategoryById.rejected, (state, action) => {
        state.updateExpensesCategoryStatus = "rejected";
        state.error = action.error.message ?? "Failed to update category";
      })

      .addCase(deleteExpensesCategoryById.pending, (state) => {
        state.delateExpensesCategoryStatus = "pending";
        state.error = null;
      })
      .addCase(deleteExpensesCategoryById.fulfilled, (state, action) => {
        state.delateExpensesCategoryStatus = "fulfilled";
        const id = action.payload;
        state.allExpensesCategory = (
          state.allExpensesCategory as IExpensesCategory[]
        ).filter((c: any) => c.id !== id);
      })
      .addCase(deleteExpensesCategoryById.rejected, (state, action) => {
        state.delateExpensesCategoryStatus = "rejected";
        state.error = action.error.message ?? "Failed to delete category";
      });
  },
});

export default AdminExpensesSlice.reducer;
