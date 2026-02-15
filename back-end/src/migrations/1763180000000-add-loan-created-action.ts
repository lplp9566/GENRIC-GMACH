import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoanCreatedAction1763180000000 implements MigrationInterface {
  name = 'AddLoanCreatedAction1763180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_actions_action_type_enum') THEN
    ALTER TYPE "loan_actions_action_type_enum" ADD VALUE IF NOT EXISTS 'LOAN_CREATED';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_payment_action_type_enum') THEN
    ALTER TYPE "loan_payment_action_type_enum" ADD VALUE IF NOT EXISTS 'LOAN_CREATED';
  END IF;
END $$;
    `);

    await queryRunner.query(`
INSERT INTO loan_actions ("loanId", action_type, date, value)
SELECT
  l.id,
  'LOAN_CREATED',
  COALESCE(l.loan_date, NOW())::date,
  COALESCE(l.loan_amount, 0)
FROM loans l
LEFT JOIN loan_actions la
  ON la."loanId" = l.id AND la.action_type = 'LOAN_CREATED'
WHERE la.id IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DELETE FROM loan_actions
WHERE action_type = 'LOAN_CREATED';
    `);
  }
}
