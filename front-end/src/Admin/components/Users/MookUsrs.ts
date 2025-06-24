export interface PaymentDetails {
  id: number;
  bank_number: number;
  bank_branch: number;
  bank_account_number: number;
  charge_date: string;
  payment_method: 'direct_debit' | 'credit_card' | 'cash';
  monthly_balance: number;
  loan_balances: any[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  join_date: string;
  email_address: string;
  phone_number: string;
  is_admin: boolean;
  payment_details: PaymentDetails;
  current_role: number;
}

export const mockUsers: User[] = [
  {
    id: 1,
    first_name: "יצחק",
    last_name: "כהן",
    id_number: "315260141",
    join_date: "2025-01-01",
    email_address: "itzchak.cohen@example.com",
    phone_number: "052-1234567",
    is_admin: true,
    payment_details: {
      id: 1,
      bank_number: 19,
      bank_branch: 286,
      bank_account_number: 561727,
      charge_date: "31",
      payment_method: "direct_debit",
      monthly_balance: 0,
      loan_balances: []
    },
    current_role: 1
  },
  {
    id: 2,
    first_name: "רחל",
    last_name: "לוי",
    id_number: "312345678",
    join_date: "2024-10-15",
    email_address: "rachel.levi@example.com",
    phone_number: "052-2345678",
    is_admin: false,
    payment_details: {
      id: 2,
      bank_number: 12,
      bank_branch: 105,
      bank_account_number: 234890,
      charge_date: "15",
      payment_method: "credit_card",
      monthly_balance: 150,
      loan_balances: [
        { loan_id: 101, balance: 2000 }
      ]
    },
    current_role: 2
  },
  {
    id: 3,
    first_name: "משה",
    last_name: "פרידמן",
    id_number: "323456789",
    join_date: "2023-07-20",
    email_address: "moshe.friedman@example.com",
    phone_number: "052-3456789",
    is_admin: false,
    payment_details: {
      id: 3,
      bank_number: 10,
      bank_branch: 210,
      bank_account_number: 987654,
      charge_date: "20",
      payment_method: "cash",
      monthly_balance: 300,
      loan_balances: []
    },
    current_role: 3
  },
  {
    id: 4,
    first_name: "שרה",
    last_name: "ישראלי",
    id_number: "334567890",
    join_date: "2022-03-11",
    email_address: "sara.israeli@example.com",
    phone_number: "052-4567890",
    is_admin: false,
    payment_details: {
      id: 4,
      bank_number: 20,
      bank_branch: 330,
      bank_account_number: 123321,
      charge_date: "11",
      payment_method: "direct_debit",
      monthly_balance: 75,
      loan_balances: []
    },
    current_role: 2
  },
  {
    id: 5,
    first_name: "יהודה",
    last_name: "לוי",
    id_number: "345678901",
    join_date: "2021-12-05",
    email_address: "yehuda.levi@example.com",
    phone_number: "052-5678901",
    is_admin: true,
    payment_details: {
      id: 5,
      bank_number: 17,
      bank_branch: 415,
      bank_account_number: 555555,
      charge_date: "05",
      payment_method: "credit_card",
      monthly_balance: 0,
      loan_balances: [
        { loan_id: 202, balance: 500 }
      ]
    },
    current_role: 1
  }
];
