import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { StockSymbol } from './StockSymbol';
import { UserAccount } from './UserAccount';

@Entity({
  name: 'user_stocks_store',
})
export class UserStocksStore {
  @PrimaryColumn()
  stock_symbol_id: string;

  @Column()
  user_account_id: string;

  @OneToOne(() => UserAccount, ua => ua.userStocksStore)
  @JoinColumn({
    name: 'user_account_id',
  })
  user: UserAccount;

  @OneToOne(() => StockSymbol, ss => ss.userStocksStore)
  @JoinColumn({
    name: 'stock_symbol_id',
  })
  stockSymbol: StockSymbol;
}
