import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ExpoSettings } from './ExpoSettings';
import { UserNotification } from './UserNotification';
import { UserStocksStore } from './UserStocksStore';

@Entity({
  name: 'user_account',
})
export class UserAccount {
  @PrimaryGeneratedColumn('increment', { type: 'int4', name: 'user_account_id' })
  id: number;

  @Column({
    type: 'varchar',
    length: 256,
  })
  name?: string;

  @Column({
    type: 'varchar',
    length: 1024,
  })
  email?: string;

  @Column({
    type: 'bytea',
    name: 'pass_hash',
  })
  passHash: Buffer;

  @Column({
    type: 'bytea',
    name: 'pass_salt',
  })
  passSalt: Buffer;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted: Date | null;

  @OneToOne(() => UserStocksStore, uss => uss.user)
  userStocksStore: UserStocksStore;

  @OneToMany(() => UserNotification, un => un.user)
  notifications: UserNotification[];

  @OneToMany(() => ExpoSettings, es => es.user)
  userExpoSettings: ExpoSettings[];
}
