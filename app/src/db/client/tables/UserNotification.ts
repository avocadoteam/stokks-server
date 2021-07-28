import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockSymbol } from './StockSymbol';
import { UserAccount } from './UserAccount';

@Entity({
  name: 'user_notification',
})
export class UserNotification {
  @PrimaryGeneratedColumn('increment', { type: 'int4', name: 'user_notification_id' })
  id: string;

  @Column({
    type: 'int4',
    name: 'price_match',
  })
  priceMatch: number;
  @Column({
    type: 'interval',
    name: 'notify_interval',
  })
  notifyInterval: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted: Date | null;

  @ManyToOne(() => StockSymbol, ss => ss.notifications)
  @JoinColumn({
    name: 'stock_symbol_id',
  })
  stockSymbol: StockSymbol;

  @ManyToOne(() => UserAccount, ua => ua.notifications)
  @JoinColumn({
    name: 'user_account_id',
  })
  userAccount: UserAccount;
}
