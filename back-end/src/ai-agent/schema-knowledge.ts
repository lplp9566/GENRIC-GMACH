export const schemaKnowledge = {
  relationships: [
    'users -> loans (one-to-many)',
    'users -> donations (one-to-many)',
    'users -> deposits (one-to-many)',
    'users -> monthly_deposits (one-to-many)',
    'users -> requests (one-to-many)',
    'users -> cash_holdings (one-to-many)',
    'users -> order-return (one-to-many)',
    'users -> user_role_history (one-to-many)',
    'users -> membership_roles (many-to-one via users.current_role)',
    'loans -> loan_actions (one-to-many)',
    'deposits -> deposits_actions (one-to-many)',
    'investments -> investment_transactions (one-to-many)',
    'membership_roles -> role_monthly_rates (one-to-many)',
  ],
  joinHints: [
    'TypeORM ManyToOne typically creates <relation>Id on the child table (e.g., loans.userId).',
    'Use users.join_date for "latest user" questions.',
    'Use donations.date / loans.loan_date / deposits.start_date / expenses.expenseDate for time-based questions.',
  ],
};
