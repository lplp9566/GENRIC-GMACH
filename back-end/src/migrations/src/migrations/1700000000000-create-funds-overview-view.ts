import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFundsOverviewView1700000000000
  implements MigrationInterface
{
  name = 'CreateFundsOverviewView1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Rename table to backup (if exists)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'funds_overview'
        ) THEN
          ALTER TABLE public.funds_overview
          RENAME TO funds_overview_old;
        END IF;
      END $$;
    `);

    // 2️⃣ Create VIEW
    await queryRunner.query(`
      CREATE OR REPLACE VIEW public.funds_overview AS
      WITH
      donations_sum AS (
        SELECT
          COALESCE(SUM(
            CASE
              WHEN action = 'donation' THEN amount
              WHEN action = 'withdraw' THEN -amount
              ELSE 0
            END
          ), 0) AS total_donations
        FROM public.donations
      ),
      loans_sum AS (
        SELECT
          COALESCE(SUM(remaining_balance), 0) AS total_loaned_out
        FROM public.loans
        WHERE "isActive" = true
      ),
      deposits_sum AS (
        SELECT
          COALESCE(SUM(current_balance), 0) AS total_user_deposits
        FROM public.deposits
        WHERE "isActive" = true
      ),
      investments_sum AS (
        SELECT
          COALESCE(SUM(total_principal_invested), 0) AS total_invested,
          COALESCE(SUM(profit_realized), 0) AS investment_profits
        FROM public.investments
        WHERE is_active = true
      ),
      cash_sum AS (
        SELECT
          COALESCE(SUM(amount), 0) AS cash_holdings
        FROM public.cash_holdings
        WHERE is_active = true
      ),
      monthly_deposits_sum AS (
        SELECT
          COALESCE(SUM(amount), 0) AS monthly_deposits
        FROM public.monthly_deposits
      ),
      funds_json AS (
        SELECT
          COALESCE(
            jsonb_object_agg(name, balance),
            '{}'::jsonb
          ) AS fund_details
        FROM public.funds
      )
      SELECT
        1 AS id,

        donations_sum.total_donations::float AS fund_principal,
        donations_sum.total_donations::float AS total_donations,

        investments_sum.investment_profits::float AS "Investment_profits",

        (donations_sum.total_donations
          + investments_sum.investment_profits
        )::float AS own_equity,

        loans_sum.total_loaned_out::float AS total_loaned_out,
        investments_sum.total_invested::float AS total_invested,

        0::float AS special_funds,

        monthly_deposits_sum.monthly_deposits::float AS monthly_deposits,

        (
          donations_sum.total_donations
          + investments_sum.investment_profits
          - loans_sum.total_loaned_out
          - investments_sum.total_invested
        )::float AS available_funds,

        cash_sum.cash_holdings::float AS cash_holdings,

        deposits_sum.total_user_deposits::float AS total_user_deposits,

        0::float AS total_equity_donations,
        0::float AS total_expenses,
        0::float AS standing_order_return,

        funds_json.fund_details::json AS fund_details
      FROM
        donations_sum,
        loans_sum,
        deposits_sum,
        investments_sum,
        cash_sum,
        monthly_deposits_sum,
        funds_json;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS public.funds_overview;`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'funds_overview_old'
        ) THEN
          ALTER TABLE public.funds_overview_old
          RENAME TO funds_overview;
        END IF;
      END $$;
    `);
  }
}
