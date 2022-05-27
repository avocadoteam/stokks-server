import { MigrationInterface, QueryRunner } from 'typeorm';

import { readMigration } from 'src/db/utils';

export class migrations1653630626696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('8_expo'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
