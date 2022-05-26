import { MigrationInterface, QueryRunner } from 'typeorm';

import { readMigration } from 'src/db/utils';

export class migrations1653561818108 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('7_expo'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
