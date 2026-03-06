export type ProfileFormData = {
  first_name: string;
  last_name: string;
  email_address: string;
  id_number: string;
  birth_date?: string | Date | null;
  phone_number: string;
  spouse_first_name: string;
  spouse_last_name: string;
  spouse_id_number: string;
  spouse_birth_date?: string | Date | null;
  bank_number: string | number;
  bank_branch: string | number;
  bank_account_number: string | number;
};

export type NotificationFormData = {
  notify_account: boolean;
  notify_receipts: boolean;
  notify_general: boolean;
};

export type ProfileRow = {
  label: string;
  value: string | number;
};
