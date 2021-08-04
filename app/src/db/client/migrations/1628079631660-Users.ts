import { readMigration } from 'src/db/utils';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1628079631660 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(readMigration('3_users'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
