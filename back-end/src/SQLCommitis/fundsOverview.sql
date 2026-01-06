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

-- תרומות קרן נטו (donated - withdrawn)
funds_donations_net AS (
  SELECT
    COALESCE(
      SUM("donatedTotal"::numeric - "withdrawnTotal"::numeric),
      0
    ) AS value
  FROM public.fund_year_stats
),

-- ✅ תרומות רגילות בלבד ברוטו
regular_donations_gross AS (
  SELECT COALESCE(SUM(amount), 0) AS value
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

-- ✅ החזרי הור"ק פתוחים (לא שולמו) = מורידים מהנזילות בלבד
standing_order_return AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public."order-return"
  WHERE paid = false
),

-- ✅ סך כל ההוצאות
expenses_sum AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public.expenses
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

-- מזומן
cash_sum AS (
  SELECT COALESCE(SUM(amount), 0) AS value
  FROM public.cash_holdings
  WHERE is_active IS DISTINCT FROM false
),

-- ✅ קרנות ברוטו: רק הכנסות לקרנות (בלי משיכות)
special_funds_gross AS (
  SELECT COALESCE(SUM("donatedTotal"::numeric), 0) AS value
  FROM public.fund_year_stats
),

-- ✅ קרנות נטו: הכנסות פחות משיכות
special_funds_net AS (
  SELECT
    COALESCE(SUM("donatedTotal"::numeric - "withdrawnTotal"::numeric), 0) AS value
  FROM public.fund_year_stats
),

funds_json AS (
  SELECT COALESCE(jsonb_object_agg(name, balance), '{}'::jsonb) AS fund_details
  FROM public.funds
)

SELECT
  1 AS id,

  -- הון עצמי
  (
    membership_fees.value
    + investments_sum.realized_profit
    + regular_donations_net.value
    + funds_donations_net.value
    + active_deposits.value
    - expenses_sum.value
  )::float AS own_equity,

  -- קרן הגמ"ח
  (
    membership_fees.value
    + regular_donations_net.value
    + investments_sum.realized_profit
    - expenses_sum.value
  )::float AS fund_principal,

  loans_sum.value::float AS total_loaned_out,
  investments_sum.total_invested_now::float AS total_invested,
  investments_sum.realized_profit::float AS "Investment_profits",

  -- ✅ שתי העמודות שביקשת: רק קרנות
  special_funds_gross.value::float AS special_funds_gross,
  special_funds_net.value::float AS special_funds_net,

  -- ✅ תאימות לאחור: משאיר special_funds כמו שהיה (ברוטו)
  special_funds_gross.value::float AS special_funds,

  membership_fees.value::float AS monthly_deposits,

  -- total_donations נשאר אצלך נטו (רגילות+קרנות נטו) כמו שכבר עשית
  (
    regular_donations_net.value
    + funds_donations_net.value
  )::float AS total_donations,

  regular_donations_gross.value::float AS total_equity_donations,

  -- כסף נזיל
  (
    (
      membership_fees.value
      + investments_sum.realized_profit
      + regular_donations_net.value
      + funds_donations_net.value
      + active_deposits.value
      - expenses_sum.value
    )
    - loans_sum.value
    - investments_sum.total_invested_now
    - standing_order_return.value
  )::float AS available_funds,

  cash_sum.value::float AS cash_holdings,
  active_deposits.value::float AS total_user_deposits,
  expenses_sum.value::float AS total_expenses,
  standing_order_return.value::float AS standing_order_return,

  funds_json.fund_details::json AS fund_details

FROM
  regular_donations_net
  CROSS JOIN funds_donations_net
  CROSS JOIN regular_donations_gross
  CROSS JOIN membership_fees
  CROSS JOIN active_deposits
  CROSS JOIN standing_order_return
  CROSS JOIN expenses_sum
  CROSS JOIN loans_sum
  CROSS JOIN investments_sum
  CROSS JOIN cash_sum
  CROSS JOIN special_funds_gross
  CROSS JOIN special_funds_net
  CROSS JOIN funds_json;
