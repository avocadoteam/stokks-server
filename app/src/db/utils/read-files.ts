import { readFileSync } from 'fs';
import { join } from 'path';

export const readMigration = (migration: string) =>
  readFileSync(join(__dirname, `../../../../../../stokks-db/migration/${migration}.up.sql`), 'utf8');
