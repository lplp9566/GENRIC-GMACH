export type SemanticMetric = {
  name: string;
  description: string;
  table: string;
  column: string;
  aggregation: 'sum' | 'count' | 'max' | 'min';
  dateColumn?: string;
  synonyms: string[];
};

export type SemanticDimension = {
  name: string;
  table: string;
  column: string;
  synonyms: string[];
};

export const semanticCatalog = {
  metrics: [
    {
      name: 'total_donations',
      description: 'סך תרומות',
      table: 'public.donations',
      column: 'amount',
      aggregation: 'sum',
      dateColumn: 'date',
      synonyms: ['תרומות', 'תרומה', 'נדרש', 'סך תרומות', 'כמה נתרם', 'סהכ תרומות'],
    },
    {
      name: 'total_loans_amount',
      description: 'סך סכום הלוואות',
      table: 'public.loans',
      column: 'loan_amount',
      aggregation: 'sum',
      dateColumn: 'loan_date',
      synonyms: ['הלוואות', 'סך הלוואות', 'כמה כסף יצא להלוואות', 'סכום הלוואות'],
    },
    {
      name: 'total_monthly_deposits',
      description: 'סך הפקדות חודשיות',
      table: 'public.monthly_deposits',
      column: 'amount',
      aggregation: 'sum',
      dateColumn: 'deposit_date',
      synonyms: ['הפקדות', 'הפקדות חודשיות', 'סך הפקדות'],
    },
    {
      name: 'available_funds',
      description: 'סכום זמין',
      table: 'public.funds_overview',
      column: 'available_funds',
      aggregation: 'sum',
      synonyms: ['סכום זמין', 'כמה כסף זמין', 'זמין'],
    },
    {
      name: 'own_equity',
      description: 'הון עצמי',
      table: 'public.funds_overview',
      column: 'own_equity',
      aggregation: 'sum',
      synonyms: ['הון עצמי', 'הון', 'equity'],
    },
    {
      name: 'active_deposits_total',
      description: 'סך יתרות פקדונות פעילים',
      table: 'public.deposits',
      column: 'current_balance',
      aggregation: 'sum',
      dateColumn: 'start_date',
      synonyms: ['כמה כסף יש בפקדונות', 'כמה כסף יש כרגע בפקדנות', 'סכום פקדונות פעילים'],
    },
    {
      name: 'active_loans_count',
      description: 'מספר הלוואות פעילות',
      table: 'public.loans',
      column: 'id',
      aggregation: 'count',
      dateColumn: 'loan_date',
      synonyms: ['כמה הלוואות פעילות', 'מספר הלוואות פעילות', 'כמה הלוואות יש כרגע'],
    },
  ] satisfies SemanticMetric[],
  dimensions: [
    {
      name: 'year',
      table: '*',
      column: 'year',
      synonyms: ['שנה', 'בשנה', 'לשנה', 'בשנת'],
    },
    {
      name: 'user',
      table: 'public.users',
      column: 'id',
      synonyms: ['משתמש', 'משתמשים'],
    },
  ] satisfies SemanticDimension[],
};
