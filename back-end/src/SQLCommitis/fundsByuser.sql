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

/* פקדונות קבועים – הפקדה ראשונית */
fixed_deposits_initial_y AS (
  SELECT
    d."userId" AS user_id,
    SUM(COALESCE(d."initialDeposit",0))::float AS total_fixed_deposits_initial
  FROM deposits d
  GROUP BY 1
),

/* פקדונות קבועים – הוספות (AddToDeposit) */
fixed_deposits_added_actions_y AS (
  SELECT
    dep."userId" AS user_id,
    SUM(CASE WHEN da.action_type = 'AddToDeposit' THEN da.amount ELSE 0 END)::float
      AS total_fixed_deposits_added
  FROM deposits_actions da
  JOIN deposits dep ON dep.id = da."depositId"
  GROUP BY 1
),

/* פקדונות קבועים – משיכות (RemoveFromDeposit) */
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

  /* סה"כ תרומות */
  COALESCE(d.total_equity_donations,0)
    + COALESCE(d.total_special_fund_donations,0) AS total_donations,

  /* תשלומים חודשיים */
  COALESCE(m.total_monthly_deposits,0) AS total_monthly_deposits,

  /* תרומות לפי סוג */
  COALESCE(d.total_equity_donations,0) AS total_equity_donations,
  COALESCE(d.total_special_fund_donations,0) AS total_special_fund_donations,

  /* מזומן (נשאר 0 אצלך) */
  0::float AS total_cash_holdings,

  /* הלוואות */
  COALESCE(lt.total_loans_taken,0) AS total_loans_taken,
  COALESCE(lr.total_loans_repaid,0) AS total_loans_repaid,
  COALESCE(lt.total_loans_taken_amount,0) AS total_loans_taken_amount,

  /* ✅ פקדונות קבועים – סה"כ הופקד = ראשוני + הוספות */
  (
    COALESCE(fdi.total_fixed_deposits_initial,0)
    + COALESCE(fda.total_fixed_deposits_added,0)
  )::float AS total_fixed_deposits_deposited,

  /* משיכות פקדונות */
  COALESCE(fw.total_fixed_deposits_withdrawn,0) AS total_fixed_deposits_withdrawn,

  /* הוראות קבע */
  COALESCE(so.total_standing_order_return,0) AS total_standing_order_return

FROM users u
LEFT JOIN monthly_y m ON m.user_id = u.id
LEFT JOIN donations_y d ON d.user_id = u.id
LEFT JOIN loans_taken_y lt ON lt.user_id = u.id
LEFT JOIN loans_repaid_y lr ON lr.user_id = u.id
LEFT JOIN fixed_deposits_initial_y fdi ON fdi.user_id = u.id
LEFT JOIN fixed_deposits_added_actions_y fda ON fda.user_id = u.id
LEFT JOIN fixed_deposits_withdrawn_y fw ON fw.user_id = u.id
LEFT JOIN standing_order_y so ON so.user_id = u.id;
