CREATE OR REPLACE VIEW user_financial_by_year_view AS
WITH
years AS (
  SELECT md."userId" AS user_id, md.year
  FROM monthly_deposits md

  UNION
  SELECT l."userId", EXTRACT(YEAR FROM l.loan_date)::int
  FROM loans l

  UNION
  SELECT l."userId", EXTRACT(YEAR FROM la."date")::int
  FROM loan_actions la
  JOIN loans l ON l.id = la."loanId"

  UNION
  SELECT d."userId", EXTRACT(YEAR FROM d."date")::int
  FROM donations d

  UNION
  SELECT dep."userId", EXTRACT(YEAR FROM da."date")::int
  FROM deposits_actions da
  JOIN deposits dep ON dep.id = da."depositId"

  UNION
  SELECT dep."userId", EXTRACT(YEAR FROM dep.start_date)::int
  FROM deposits dep

  UNION
  SELECT orr."userId", EXTRACT(YEAR FROM orr."date")::int
  FROM "order-return" orr
),

monthly_y AS (
  SELECT
    md."userId" AS user_id,
    md.year,
    SUM(md.amount)::float AS total_monthly_deposits
  FROM monthly_deposits md
  GROUP BY 1,2
),

donations_y AS (
  SELECT
    d."userId" AS user_id,
    EXTRACT(YEAR FROM d."date")::int AS year,
    SUM(CASE WHEN d."fundId" IS NULL THEN d.amount ELSE 0 END)::float AS total_equity_donations,
    SUM(CASE WHEN d."fundId" IS NOT NULL THEN d.amount ELSE 0 END)::float AS special_fund_donations
  FROM donations d
  GROUP BY 1,2
),

loans_taken_y AS (
  SELECT
    l."userId" AS user_id,
    EXTRACT(YEAR FROM l.loan_date)::int AS year,
    COUNT(*)::int AS total_loans_taken_count,
    SUM(COALESCE(l.loan_amount,0))::float AS total_loans_taken_amount
  FROM loans l
  GROUP BY 1,2
),

loans_repaid_y AS (
  SELECT
    l."userId" AS user_id,
    EXTRACT(YEAR FROM la."date")::int AS year,
    SUM(CASE WHEN la.action_type = 'PAYMENT' THEN la.value ELSE 0 END)::float AS total_loans_repaid
  FROM loan_actions la
  JOIN loans l ON l.id = la."loanId"
  GROUP BY 1,2
),

/* ✅ פקדונות קבועים – הפקדה ראשונית (לפי שנת start_date) */
fixed_deposits_initial_y AS (
  SELECT
    d."userId" AS user_id,
    EXTRACT(YEAR FROM d.start_date)::int AS year,
    SUM(COALESCE(d."initialDeposit",0))::float AS total_fixed_deposits_initial
  FROM deposits d
  GROUP BY 1,2
),

/* ✅ פקדונות קבועים – הוספות (AddToDeposit) לפי שנת הפעולה */
fixed_deposits_add_actions_y AS (
  SELECT
    dep."userId" AS user_id,
    EXTRACT(YEAR FROM da."date")::int AS year,
    SUM(CASE WHEN da.action_type = 'AddToDeposit' THEN da.amount ELSE 0 END)::float
      AS total_fixed_deposits_added_actions
  FROM deposits_actions da
  JOIN deposits dep ON dep.id = da."depositId"
  GROUP BY 1,2
),

/* משיכות (RemoveFromDeposit) */
fixed_deposits_withdrawn_y AS (
  SELECT
    dep."userId" AS user_id,
    EXTRACT(YEAR FROM da."date")::int AS year,
    SUM(CASE WHEN da.action_type = 'RemoveFromDeposit' THEN da.amount ELSE 0 END)::float
      AS total_fixed_deposits_withdrawn
  FROM deposits_actions da
  JOIN deposits dep ON dep.id = da."depositId"
  GROUP BY 1,2
),

standing_order_y AS (
  SELECT
    orr."userId" AS user_id,
    EXTRACT(YEAR FROM orr."date")::int AS year,
    SUM(CASE WHEN orr.paid = true THEN orr.amount ELSE 0 END)::float AS total_standing_order_return
  FROM "order-return" orr
  GROUP BY 1,2
)

SELECT
  ROW_NUMBER() OVER (ORDER BY y.user_id, y.year)::int AS id,
  y.user_id,
  y.year,

  COALESCE(m.total_monthly_deposits,0) AS total_monthly_deposits,
  COALESCE(d.total_equity_donations,0) AS total_equity_donations,
  COALESCE(d.special_fund_donations,0) AS special_fund_donations,

  COALESCE(lt.total_loans_taken_count,0)  AS total_loans_taken_count,
  COALESCE(lt.total_loans_taken_amount,0) AS total_loans_taken_amount,

  COALESCE(lr.total_loans_repaid,0) AS total_loans_repaid,

  /* ✅ אותו שם עמודה כמו שהיה לך, פשוט כולל גם initial וגם AddToDeposit */
  (
    COALESCE(fdi.total_fixed_deposits_initial,0)
    + COALESCE(fda.total_fixed_deposits_added_actions,0)
  )::float AS total_fixed_deposits_added,

  COALESCE(fw.total_fixed_deposits_withdrawn,0) AS total_fixed_deposits_withdrawn,

  COALESCE(so.total_standing_order_return,0) AS total_standing_order_return,

  (COALESCE(d.total_equity_donations,0) + COALESCE(d.special_fund_donations,0))::float
    AS total_donations

FROM years y
LEFT JOIN monthly_y m ON m.user_id = y.user_id AND m.year = y.year
LEFT JOIN donations_y d ON d.user_id = y.user_id AND d.year = y.year
LEFT JOIN loans_taken_y lt ON lt.user_id = y.user_id AND lt.year = y.year
LEFT JOIN loans_repaid_y lr ON lr.user_id = y.user_id AND lr.year = y.year
LEFT JOIN fixed_deposits_initial_y fdi ON fdi.user_id = y.user_id AND fdi.year = y.year
LEFT JOIN fixed_deposits_add_actions_y fda ON fda.user_id = y.user_id AND fda.year = y.year
LEFT JOIN fixed_deposits_withdrawn_y fw ON fw.user_id = y.user_id AND fw.year = y.year
LEFT JOIN standing_order_y so ON so.user_id = y.user_id AND so.year = y.year
ORDER BY y.user_id, y.year;
