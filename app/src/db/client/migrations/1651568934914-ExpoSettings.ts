import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1651568934914 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('6_expo'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
