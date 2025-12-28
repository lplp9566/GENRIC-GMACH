CREATE OR REPLACE VIEW user_financial_view AS
WITH
/* תשלומים חודשיים */
monthly_y AS (
  SELECT
    md."userId" AS user_id,
    SUM(md.amount)::float AS total_monthly_deposits
  FROM monthly_deposits md
  GROUP BY 1
),

/* תרומות */
donations_y AS (
  SELECT
    d."userId" AS user_id,
    SUM(CASE WHEN d."fundId" IS NULL THEN d.amount ELSE 0 END)::float AS total_equity_donations,
    SUM(CASE WHEN d."fundId" IS NOT NULL THEN d.amount ELSE 0 END)::float AS total_special_fund_donations
  FROM donations d
  GROUP BY 1
),

/* הלוואות שנלקחו */
loans_taken_y AS (
  SELECT
    l."userId" AS user_id,
    COUNT(*)::int AS total_loans_taken,
    SUM(COALESCE(l.loan_amount,0))::float AS total_loans_taken_amount
  FROM loans l
  GROUP BY 1
),

/* החזרי הלוואות */
loans_repaid_y AS (
  SELECT
    l."userId" AS user_id,
    SUM(CASE WHEN la.action_type = 'PAYMENT' THEN la.value ELSE 0 END)::float AS total_loans_repaid
  FROM loan_actions la
  JOIN loans l ON l.id = la."loanId"
  GROUP BY 1
),

/* פקדונות קבועים – הפקדה */
fixed_deposits_added_y AS (
  SELECT
    d."userId" AS user_id,
    SUM(d."initialDeposit")::float AS total_fixed_deposits_deposited
  FROM deposits d
  GROUP BY 1
),

/* פקדונות קבועים – משיכה */
fixed_deposits_withdrawn_y AS (
  SELECT
    dep."userId" AS user_id,
    SUM(CASE WHEN da.action_type = 'RemoveFromDeposit' THEN da.amount ELSE 0 END)::float
      AS total_fixed_deposits_withdrawn
  FROM deposits_actions da
  JOIN deposits dep ON dep.id = da."depositId"
  GROUP BY 1
),

/* הוראות קבע */
standing_order_y AS (
  SELECT
    orr."userId" AS user_id,
    SUM(CASE WHEN orr.paid = true THEN orr.amount ELSE 0 END)::float AS total_standing_order_return
  FROM "order-return" orr
  GROUP BY 1
)

SELECT
  ROW_NUMBER() OVER (ORDER BY u.id)::int AS id,
  u.id AS user_id,

  COALESCE(d.total_equity_donations,0)
    + COALESCE(d.total_special_fund_donations,0) AS total_donations,

  COALESCE(m.total_monthly_deposits,0) AS total_monthly_deposits,
  COALESCE(d.total_equity_donations,0) AS total_equity_donations,
  0::float AS total_cash_holdings, -- אם יש לך מקור, נחבר
  COALESCE(d.total_special_fund_donations,0) AS total_special_fund_donations,

  COALESCE(lt.total_loans_taken,0) AS total_loans_taken,
  COALESCE(lr.total_loans_repaid,0) AS total_loans_repaid,

  COALESCE(fd.total_fixed_deposits_deposited,0) AS total_fixed_deposits_deposited,
  COALESCE(fw.total_fixed_deposits_withdrawn,0) AS total_fixed_deposits_withdrawn,

  COALESCE(so.total_standing_order_return,0) AS total_standing_order_return

FROM users u
LEFT JOIN monthly_y m ON m.user_id = u.id
LEFT JOIN donations_y d ON d.user_id = u.id
LEFT JOIN loans_taken_y lt ON lt.user_id = u.id
LEFT JOIN loans_repaid_y lr ON lr.user_id = u.id
LEFT JOIN fixed_deposits_added_y fd ON fd.user_id = u.id
LEFT JOIN fixed_deposits_withdrawn_y fw ON fw.user_id = u.id
LEFT JOIN standing_order_y so ON so.user_id = u.id;
