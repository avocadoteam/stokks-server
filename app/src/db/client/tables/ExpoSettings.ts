import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserAccount } from './UserAccount';

@Entity({
  name: 'expo_settings',
})
export class ExpoSettings {
  @PrimaryGeneratedColumn('increment', { type: 'int4', name: 'expo_settings_id' })
  id: number;

  @Column({
    type: 'bytea',
    name: 'push_token',
  })
  token: Buffer;

  @Column({
    type: 'text',
  })
  device: string;

  @ManyToOne(() => UserAccount, ua => ua.userStocksStore)
  @JoinColumn({
    name: 'user_account_id',
  })
  user: UserAccount;
}
