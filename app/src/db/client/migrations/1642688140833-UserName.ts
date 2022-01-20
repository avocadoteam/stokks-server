import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserName1642688140833 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('4_user_name'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
