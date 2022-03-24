import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmail1648113253677 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('5_user_email'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
