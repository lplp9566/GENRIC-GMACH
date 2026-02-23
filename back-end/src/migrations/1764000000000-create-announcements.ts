import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnnouncements1764000000000 implements MigrationInterface {
  name = 'CreateAnnouncements1764000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(200),
        "body" text NOT NULL,
        "created_by_user_id" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_announcements_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_announcements_created_by_user"
          FOREIGN KEY ("created_by_user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "announcement_recipients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "announcement_id" uuid NOT NULL,
        "user_id" integer NOT NULL,
        "delivered_at" TIMESTAMPTZ NULL,
        "read_at" TIMESTAMPTZ NULL,
        CONSTRAINT "PK_announcement_recipients_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_announcement_recipients_announcement_user"
          UNIQUE ("announcement_id", "user_id"),
        CONSTRAINT "FK_announcement_recipients_announcement"
          FOREIGN KEY ("announcement_id")
          REFERENCES "announcements"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_announcement_recipients_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_announcement_recipients_announcement_id"
      ON "announcement_recipients" ("announcement_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_announcement_recipients_user_id"
      ON "announcement_recipients" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_announcement_recipients_read_at"
      ON "announcement_recipients" ("read_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_announcement_recipients_read_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_announcement_recipients_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_announcement_recipients_announcement_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "announcement_recipients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "announcements"`);
  }
}
