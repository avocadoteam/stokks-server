import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserNotification } from './UserNotification';
import { UserStocksStore } from './UserStocksStore';

@Entity({
  name: 'user_account',
})
export class UserAccount {
  @PrimaryGeneratedColumn('increment', { type: 'int4', name: 'user_account_id' })
  id: string;

  @OneToOne(() => UserStocksStore, uss => uss.user)
  userStocksStore: UserStocksStore;

  @OneToMany(() => UserNotification, un => un.userAccount)
  notifications: UserNotification[];
}
