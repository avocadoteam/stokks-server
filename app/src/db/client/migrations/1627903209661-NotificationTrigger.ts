import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationTrigger1627903209661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('2_notification'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
