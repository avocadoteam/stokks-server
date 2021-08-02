import { NotificationIntervalTarget, TriggerName, TriggerParam } from '@models';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockSymbol } from './StockSymbol';
import { UserAccount } from './UserAccount';

@Entity({
  name: 'user_notification',
})
export class UserNotification {
  @PrimaryGeneratedColumn('increment', { type: 'int4', name: 'user_notification_id' })
  id: number;

  @Column({
    type: 'varchar',
    name: 'trigger_name',
    length: 64,
  })
  triggerName: TriggerName;

  @Column({
    type: 'varchar',
    name: 'trigger_param',
    length: 2,
  })
  triggerParam: TriggerParam;

  @Column({
    type: 'text',
    name: 'trigger_value',
  })
  triggerValue: string;

  @Column({
    type: 'interval',
    name: 'notify_interval',
  })
  notifyInterval: NotificationIntervalTarget;

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
  user: UserAccount;
}
