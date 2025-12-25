CREATE OR REPLACE VIEW public.funds_overview_view AS
WITH
-- תרומות רגילות נטו (לקרן/הון עצמי)
regular_donations_net AS (
  SELECT
    COALESCE(SUM(
      CASE
        WHEN action = 'donation' THEN amount
        WHEN action = 'withdraw' THEN -amount
        ELSE 0
      END
    ), 0) AS value
  FROM public.donations
  WHERE "fundId" IS NULL
),

-- תרומות קרן נטו
funds_donations_net AS (
  SELECT
    COALESCE(
      SUM("donatedTotal"::numeric - "withdrawnTotal"::numeric),
      0
    ) AS value
  FROM public.fund_year_stats
),

-- ✅ סך כל התרומות ברוטו (רגילות + קרן)
donations_total_gross AS (
  SELECT
    COALESCE(SUM(amount), 0) AS value
  FROM public.donations
  WHERE action = 'donation'
),

-- ✅ תרומות רגילות בלבד ברוטו
regular_donations_gross AS (
  SELECT
    COALESCE(SUM(amount), 0) AS value
  FROM public.donations
  WHERE action = 'donation' AND "fundId" IS NULL
),

-- דמי חבר
membership_fees AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public.monthly_deposits
),

-- פקדונות פעילים
active_deposits AS (
  SELECT COALESCE(SUM(current_balance), 0) AS value
  FROM public.deposits
  WHERE "isActive" = true
),

-- החזרי הור"ק ששולמו
standing_order_return_sum AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public."order-return"
  WHERE paid = true
),

-- הלוואות פעילות
loans_sum AS (
  SELECT COALESCE(SUM(remaining_balance), 0) AS value
  FROM public.loans
  WHERE "isActive" = true
),

-- השקעות (נעול עכשיו + רווח ממומש)
investments_sum AS (
  SELECT
    COALESCE(SUM(principal_remaining), 0) AS total_invested_now,
    COALESCE(SUM(profit_realized), 0) AS realized_profit
  FROM public.investments
  WHERE is_active = true
),

-- מזומן (לתצוגה בלבד)
cash_sum AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public.cash_holdings
  WHERE is_active IS DISTINCT FROM false
),

-- קרנות מיוחדות = סך כל ההכנסות לקרנות (ברוטו, בלי משיכות)
special_funds_sum AS (
  SELECT COALESCE(SUM("donatedTotal"::numeric), 0) AS value
  FROM public.fund_year_stats
),

funds_json AS (
  SELECT COALESCE(jsonb_object_agg(name, balance), '{}'::jsonb) AS fund_details
  FROM public.funds
)

SELECT
  1 AS id,

  -- הון עצמי (לפי ההגדרה שלך, בלי cash)
  (
    membership_fees.value
    + investments_sum.realized_profit
    + regular_donations_net.value
    + funds_donations_net.value
    + standing_order_return_sum.value
    + active_deposits.value
  )::float AS own_equity,

  -- קרן הגמ"ח: דמי חבר + תרומות רגילות נטו + רווח ממומש
  (
    membership_fees.value
    + regular_donations_net.value
    + investments_sum.realized_profit
  )::float AS fund_principal,

  loans_sum.value::float AS total_loaned_out,
  investments_sum.total_invested_now::float AS total_invested,
  investments_sum.realized_profit::float AS "Investment_profits",

  special_funds_sum.value::float AS special_funds,
  membership_fees.value::float AS monthly_deposits,

  -- ✅ סך כל התרומות (רגילות + קרן) ברוטו
  donations_total_gross.value::float AS total_donations,

  -- ✅ תרומות רגילות בלבד (ברוטו) – משתמשים בשדה שקיים בסכימה
  regular_donations_gross.value::float AS total_equity_donations,

  -- כסף נזיל
  (
    (
      membership_fees.value
      + investments_sum.realized_profit
      + regular_donations_net.value
      + funds_donations_net.value
      + standing_order_return_sum.value
      + active_deposits.value
    )
    - loans_sum.value
    - investments_sum.total_invested_now
  )::float AS available_funds,

  cash_sum.value::float AS cash_holdings,
  active_deposits.value::float AS total_user_deposits,

  0::float AS total_expenses,
  standing_order_return_sum.value::float AS standing_order_return,
  funds_json.fund_details::json AS fund_details

FROM
  regular_donations_net
  CROSS JOIN funds_donations_net
  CROSS JOIN donations_total_gross
  CROSS JOIN regular_donations_gross
  CROSS JOIN membership_fees
  CROSS JOIN active_deposits
  CROSS JOIN standing_order_return_sum
  CROSS JOIN loans_sum
  CROSS JOIN investments_sum
  CROSS JOIN cash_sum
  CROSS JOIN special_funds_sum
  CROSS JOIN funds_json;
