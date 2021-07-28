import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1627454869150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('1_init'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
