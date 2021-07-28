create unique index stock_symbol_namex on stock_symbol (name, deleted) where deleted is null;
create index user_notification_user_account_idx on user_notification (user_account_id);
create index user_notification_stock_symbol_idx on user_notification (stock_symbol_id);
