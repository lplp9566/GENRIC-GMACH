CREATE OR REPLACE VIEW funds_overview_by_year_view AS
WITH
years AS (
  SELECT DISTINCT EXTRACT(YEAR FROM l.loan_date)::int AS year FROM loans l
  UNION SELECT DISTINCT EXTRACT(YEAR FROM la."date")::int FROM loan_actions la
  UNION SELECT DISTINCT EXTRACT(YEAR FROM da."date")::int FROM deposits_actions da
  UNION SELECT DISTINCT EXTRACT(YEAR FROM d."date")::int FROM donations d
  UNION SELECT DISTINCT EXTRACT(YEAR FROM it.transaction_date)::int FROM investment_transactions it
  UNION SELECT DISTINCT EXTRACT(YEAR FROM orr."date")::int FROM "order-return" orr
  UNION SELECT DISTINCT EXTRACT(YEAR FROM e."expenseDate")::int FROM expenses e
  UNION SELECT DISTINCT fys.year::int FROM fund_year_stats fys
  UNION SELECT DISTINCT md.year::int FROM monthly_deposits md
),

/* ✅ תשלומים חודשיים – מקור אמת */
monthly_deposits_y AS (
  SELECT
    md.year::int AS year,
    SUM(COALESCE(md.amount,0))::float AS total_monthly_deposits
  FROM monthly_deposits md
  GROUP BY 1
),

loans_taken_y AS (
  SELECT
    EXTRACT(YEAR FROM l.loan_date)::int AS year,
    COUNT(*)::int AS total_loans_taken,
    SUM(COALESCE(l.loan_amount, 0))::float AS total_loans_amount
  FROM loans l
  GROUP BY 1
),

loans_repaid_y AS (
  SELECT
    EXTRACT(YEAR FROM la."date")::int AS year,
    SUM(CASE WHEN la.action_type = 'PAYMENT' THEN la.value ELSE 0 END)::float AS total_loans_repaid
  FROM loan_actions la
  GROUP BY 1
),

/* פקדונות (לא תשלומים חודשיים) */
deposits_actions_y AS (
  SELECT
    EXTRACT(YEAR FROM da."date")::int AS year,
    SUM(CASE WHEN da.action_type = 'RemoveFromDeposit' THEN COALESCE(da.amount,0) ELSE 0 END)::float AS total_fixed_deposits_withdrawn
  FROM deposits_actions da
  GROUP BY 1
),

fixed_deposits_initial_y AS (
  SELECT
    EXTRACT(YEAR FROM d.start_date)::int AS year,
    SUM(COALESCE(d."initialDeposit",0))::float AS total_fixed_deposits_added
  FROM deposits d
  GROUP BY 1
),

equity_donations_y AS (
  SELECT
    EXTRACT(YEAR FROM d."date")::int AS year,
    SUM(
      CASE
        WHEN d.action = 'donation' AND d."fundId" IS NULL
        THEN d.amount ELSE 0
      END
    )::float AS total_equity_donations
  FROM donations d
  GROUP BY 1
),

special_funds_y AS (
  SELECT
    fys.year::int AS year,
    SUM(COALESCE(fys."donatedTotal"::numeric, 0))::float AS special_fund_donations,
    SUM(COALESCE(fys."withdrawnTotal"::numeric, 0))::float AS total_special_funds_withdrawn
  FROM fund_year_stats fys
  GROUP BY 1
),

fund_details_y AS (
  SELECT
    fys.year::int AS year,
    jsonb_object_agg(f.name, COALESCE(fys."donatedTotal"::numeric,0)::float) AS fund_details_donated,
    jsonb_object_agg(f.name, COALESCE(fys."withdrawnTotal"::numeric,0)::float) AS fund_details_withdrawn
  FROM fund_year_stats fys
  JOIN funds f ON f.id = fys."fundId"
  GROUP BY 1
),

standing_order_return_y AS (
  SELECT
    EXTRACT(YEAR FROM orr."date")::int AS year,
    SUM(CASE WHEN orr.paid = true THEN orr.amount ELSE 0 END)::float AS total_standing_order_return
  FROM "order-return" orr
  GROUP BY 1
),

investments_y AS (
  SELECT
    EXTRACT(YEAR FROM it.transaction_date)::int AS year,
    SUM(
      CASE
        WHEN it.transaction_type IN ('INITIAL_INVESTMENT','ADDITIONAL_INVESTMENT','MANAGEMENT_FEE')
        THEN it.amount::numeric ELSE 0
      END
    )::float AS total_investments_out,
    SUM(
      CASE
        WHEN it.transaction_type = 'WITHDRAWAL'
        THEN it.amount::numeric ELSE 0
      END
    )::float AS total_investments_in
  FROM investment_transactions it
  GROUP BY 1
),

expenses_y AS (
  SELECT
    EXTRACT(YEAR FROM e."expenseDate")::int AS year,
    SUM(e.amount)::float AS total_expenses
  FROM expenses e
  GROUP BY 1
)

SELECT
  ROW_NUMBER() OVER (ORDER BY y.year)::int AS id,
  y.year,

  -- ✅ עכשיו זה מגיע מהטבלה הנכונה
  COALESCE(md.total_monthly_deposits, 0) AS total_monthly_deposits,

  COALESCE(eq.total_equity_donations, 0) AS total_equity_donations,

  COALESCE(sf.special_fund_donations, 0) AS special_fund_donations,
  COALESCE(sf.total_special_funds_withdrawn, 0) AS total_special_funds_withdrawn,

  COALESCE(lt.total_loans_taken, 0) AS total_loans_taken,
  COALESCE(lt.total_loans_amount, 0) AS total_loans_amount,
  COALESCE(lr.total_loans_repaid, 0) AS total_loans_repaid,

  COALESCE(fd0.total_fixed_deposits_added, 0) AS total_fixed_deposits_added,
  COALESCE(da.total_fixed_deposits_withdrawn, 0) AS total_fixed_deposits_withdrawn,

  COALESCE(sor.total_standing_order_return, 0) AS total_standing_order_return,

  COALESCE(inv.total_investments_out, 0) AS total_investments_out,
  COALESCE(inv.total_investments_in, 0) AS total_investments_in,

  COALESCE(fdy.fund_details_donated, '{}'::jsonb) AS fund_details_donated,
  COALESCE(fdy.fund_details_withdrawn, '{}'::jsonb) AS fund_details_withdrawn,

  COALESCE(ex.total_expenses, 0) AS total_expenses,

  (COALESCE(eq.total_equity_donations, 0) + COALESCE(sf.special_fund_donations, 0))::float AS total_donations

FROM years y
LEFT JOIN monthly_deposits_y md ON md.year = y.year
LEFT JOIN loans_taken_y lt ON lt.year = y.year
LEFT JOIN loans_repaid_y lr ON lr.year = y.year
LEFT JOIN deposits_actions_y da ON da.year = y.year
LEFT JOIN fixed_deposits_initial_y fd0 ON fd0.year = y.year
LEFT JOIN equity_donations_y eq ON eq.year = y.year
LEFT JOIN special_funds_y sf ON sf.year = y.year
LEFT JOIN fund_details_y fdy ON fdy.year = y.year
LEFT JOIN standing_order_return_y sor ON sor.year = y.year
LEFT JOIN investments_y inv ON inv.year = y.year
LEFT JOIN expenses_y ex ON ex.year = y.year
ORDER BY y.year;
