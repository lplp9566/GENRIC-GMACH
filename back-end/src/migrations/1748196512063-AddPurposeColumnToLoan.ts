import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurposeColumnToLoan1748196512063 implements MigrationInterface {
    name = 'AddPurposeColumnToLoan1748196512063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loans" ADD "purpose" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loans" DROP COLUMN "purpose"`);
    }

}
