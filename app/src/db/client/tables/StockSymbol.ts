import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserNotification } from './UserNotification';
import { UserStocksStore } from './UserStocksStore';

@Entity({
  name: 'stock_symbol',
})
export class StockSymbol {
  @PrimaryGeneratedColumn('increment', { type: 'int8', name: 'stock_symbol_id' })
  id: string;

  @Column({
    type: 'varchar',
    length: 8,
  })
  name: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  deleted: Date | null;

  @OneToOne(() => UserStocksStore, uss => uss.stockSymbol)
  userStocksStore: UserStocksStore;

  @OneToMany(() => UserNotification, un => un.stockSymbol)
  notifications: UserNotification[];
}
