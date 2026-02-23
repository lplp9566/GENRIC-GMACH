import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAudienceToAnnouncements1764555000000
  implements MigrationInterface
{
  name = 'AddAudienceToAnnouncements1764555000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "announcements"
      ADD COLUMN IF NOT EXISTS "audience" character varying(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "announcements"
      DROP COLUMN IF EXISTS "audience"
    `);
  }
}
