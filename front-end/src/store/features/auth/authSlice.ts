import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../axiosInstance";

type Status = "idle" | "pending" | "fulfilled" | "rejected";

export interface AuthUser {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
  is_admin?: boolean;
}

export interface LoginDto { email: string; password: string; }

interface AuthState {
  user: AuthUser | null;
  status: Status;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

// POST /auth/login — השרת מציב cookie ומחזיר {message}
export const login = createAsyncThunk<void, LoginDto, { rejectValue: string }>(
  "auth/login",
  async (dto, { rejectWithValue }) => {
    try {
      await api.post("/auth/login", dto);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? "Login failed");
    }
  }
);

// GET /auth/validate — מחזיר את המשתמש (אם ה-cookie תקין)
export const validate = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  "auth/validate",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<AuthUser>("/auth/validate");
      return data;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? "Not authenticated");
    }
  }
);

// POST /auth/logout — מנקה cookie
export const logoutServer = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? "Logout failed");
    }
  }
);

 export const Authslice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // לוגאאוט בצד לקוח (ליתר בטחון)
    logoutLocal(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (s) => { s.status = "pending"; s.error = null; });
    builder.addCase(login.fulfilled, (s) => { s.status = "fulfilled"; });
    builder.addCase(login.rejected, (s, a) => { s.status = "rejected"; s.error = a.payload ?? "Login failed"; });

    builder.addCase(validate.pending, (s) => { s.status = "pending"; });
    builder.addCase(validate.fulfilled, (s, a) => { s.status = "fulfilled"; s.user = a.payload; });
    builder.addCase(validate.rejected, (s) => { s.status = "rejected"; s.user = null; });

    builder.addCase(logoutServer.fulfilled, (s) => { s.user = null; s.status = "idle"; s.error = null; });
  },
});

export const { logoutLocal } = Authslice.actions;
export const selectAuth = (s: any) => s.auth as AuthState;
export const selectIsAuthenticated = (s: any) => Boolean((s.auth as AuthState).user);

export default Authslice.reducer;
