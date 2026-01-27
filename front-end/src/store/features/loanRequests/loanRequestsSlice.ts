import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../axiosInstance";

export type LoanRequestStatus =
  | "DRAFT"
  | "CHECK_FAILED"
  | "NEED_DETAILS"
  | "NEED_GUARANTOR"
  | "GUARANTOR_PENDING"
  | "GUARANTOR_REJECTED"
  | "ADMIN_PENDING"
  | "ADMIN_APPROVED"
  | "ADMIN_REJECTED";

export type GuarantorRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LoanRequest {
  id: number;
  user: { id: number; first_name: string; last_name: string };
  amount: number;
  monthly_payment: number;
  purpose?: string | null;
  payment_date?: number | null;
  payment_method?: string | null;
  status: LoanRequestStatus;
  error_message?: string | null;
  max_allowed?: number | null;
  admin_note?: string | null;
  guarantor_requests?: GuarantorRequest[];
  created_at?: string;
}

export interface GuarantorRequest {
  id: number;
  request: LoanRequest;
  guarantor: { id: number; first_name: string; last_name: string };
  status: GuarantorRequestStatus;
  created_at?: string;
}

export interface LoanCheckResponse {
  ok: boolean;
  error: string;
  butten: boolean;
}

interface LoanRequestsState {
  requests: LoanRequest[];
  guarantorRequests: GuarantorRequest[];
  checkResponse: LoanCheckResponse | null;
  status: "idle" | "pending" | "fulfilled" | "rejected";
  error?: string | null;
}

const initialState: LoanRequestsState = {
  requests: [],
  guarantorRequests: [],
  checkResponse: null,
  status: "idle",
  error: null,
};

export const checkLoanRequest = createAsyncThunk(
  "loanRequests/check",
  async (payload: {
    userId: number;
    amount: number;
    monthly_payment: number;
    payment_date?: number;
  }) => {
    const res = await api.post<LoanCheckResponse>(`/loan-requests/check`, payload);
    return res.data;
  }
);

export const createLoanRequest = createAsyncThunk(
  "loanRequests/create",
  async (payload: {
    userId: number;
    amount: number;
    monthly_payment: number;
    payment_date?: number;
    purpose?: string;
    payment_method?: string;
  }) => {
    const res = await api.post(`/loan-requests`, payload);
    return res.data as { request: LoanRequest | null; check: LoanCheckResponse };
  }
);

export const fetchLoanRequests = createAsyncThunk(
  "loanRequests/list",
  async (userId?: number) => {
    const res = await api.get<LoanRequest[]>(`/loan-requests`, {
      params: userId ? { userId } : undefined,
    });
    return res.data;
  }
);

export const fetchGuarantorRequests = createAsyncThunk(
  "loanRequests/guarantor",
  async (userId: number) => {
    const res = await api.get<GuarantorRequest[]>(
      `/loan-requests/guarantor`,
      { params: { userId } }
    );
    return res.data;
  }
);

export const updateLoanRequestDetails = createAsyncThunk(
  "loanRequests/details",
  async (payload: {
    id: number;
    purpose: string;
    amount?: number;
    monthly_payment?: number;
    payment_date: number;
    payment_method: string;
  }) => {
    const res = await api.patch<LoanRequest>(
      `/loan-requests/${payload.id}/details`,
      payload
    );
    return res.data;
  }
);

export const addGuarantor = createAsyncThunk(
  "loanRequests/addGuarantor",
  async (payload: { id: number; guarantorId: number }) => {
    const res = await api.post(
      `/loan-requests/${payload.id}/guarantor`,
      { guarantorId: payload.guarantorId }
    );
    return res.data;
  }
);

export const approveGuarantor = createAsyncThunk(
  "loanRequests/approveGuarantor",
  async (payload: { id: number; gid: number }) => {
    const res = await api.post(`/loan-requests/${payload.id}/guarantor/${payload.gid}/approve`);
    return res.data;
  }
);

export const rejectGuarantor = createAsyncThunk(
  "loanRequests/rejectGuarantor",
  async (payload: { id: number; gid: number }) => {
    const res = await api.post(`/loan-requests/${payload.id}/guarantor/${payload.gid}/reject`);
    return res.data;
  }
);

export const adminApproveRequest = createAsyncThunk(
  "loanRequests/adminApprove",
  async (id: number) => {
    const res = await api.post(`/loan-requests/${id}/admin-approve`);
    return res.data;
  }
);

export const adminRejectRequest = createAsyncThunk(
  "loanRequests/adminReject",
  async (payload: { id: number; note?: string }) => {
    const res = await api.post(`/loan-requests/${payload.id}/admin-reject`, {
      note: payload.note,
    });
    return res.data;
  }
);

const loanRequestsSlice = createSlice({
  name: "loanRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkLoanRequest.pending, (state) => {
        state.status = "pending";
      })
      .addCase(checkLoanRequest.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.checkResponse = action.payload;
      })
      .addCase(checkLoanRequest.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message ?? null;
      })
      .addCase(createLoanRequest.fulfilled, (state, action) => {
        if (action.payload.request) {
          state.requests = [action.payload.request, ...state.requests];
        }
        state.checkResponse = action.payload.check;
      })
      .addCase(fetchLoanRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(fetchGuarantorRequests.fulfilled, (state, action) => {
        state.guarantorRequests = action.payload;
      })
      .addCase(updateLoanRequestDetails.fulfilled, (state, action) => {
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.requests[idx] = action.payload;
      })
      .addCase(adminApproveRequest.fulfilled, (state, action) => {
        const updated = action.payload as LoanRequest;
        const idx = state.requests.findIndex((r) => r.id === updated.id);
        if (idx !== -1) state.requests[idx] = updated;
      })
      .addCase(adminRejectRequest.fulfilled, (state, action) => {
        const updated = action.payload as LoanRequest;
        const idx = state.requests.findIndex((r) => r.id === updated.id);
        if (idx !== -1) state.requests[idx] = updated;
      });
  },
});

export default loanRequestsSlice.reducer;
