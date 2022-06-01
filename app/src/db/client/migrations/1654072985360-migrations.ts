import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1654072985360 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('9_user'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
