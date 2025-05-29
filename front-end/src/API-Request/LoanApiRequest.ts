// // loanService.ts
// import api from "./api";
// import { LoanData, LoanResponse } from "./types/loan";
// import { AxiosError } from "axios";

// export const createLoan = async (loanData: LoanData): Promise<LoanResponse> => {
//   try {
//     const response = await api.post<LoanResponse>("/loans", loanData);
//     return response.data;
//   } catch (err) {
//     const error = err as AxiosError<{ message: string }>;
//     const msg = error.response?.data?.message ?? "Failed to create loan";
//     // אפשר לוגים, סנכרון Sentry וכד׳
//     return Promise.reject(msg);
//   }
// };
