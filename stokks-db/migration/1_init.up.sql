create table stock_symbol (
  stock_symbol_id bigserial,
  name varchar(8) not null,
  deleted timestamp,
  primary key (stock_symbol_id)
);

create table user_account (
  user_account_id serial,
  primary key (user_account_id)
);

create table user_stocks_store (
  stock_symbol_id int8 not null,
  user_account_id int4 not null,
  primary key (stock_symbol_id, user_account_id)
);

create table user_notification (
  user_notification_id serial,
  price_match int4 not null,
  notify_interval interval not null,
  stock_symbol_id int8 not null,
  user_account_id int4 not null,
  deleted timestamp,
  primary key (user_notification_id)
);

create function schema_create_fk_constraint(table_name text, column_name text, foreign_table_name text, foreign_column_name text) returns void as $$
  declare sql_text text;
  begin sql_text := format ('alter table %s add constraint fk_%s_%s foreign key (%s) references %s(%s)',
                            table_name, table_name, column_name, column_name, foreign_table_name, foreign_column_name); execute sql_text;
  end
$$ language plpgsql;

select schema_create_fk_constraint('user_stocks_store', 'user_account_id', 'user_account', 'user_account_id');
select schema_create_fk_constraint('user_stocks_store', 'stock_symbol_id', 'stock_symbol', 'stock_symbol_id');

select schema_create_fk_constraint('user_notification', 'user_account_id', 'user_account', 'user_account_id');
select schema_create_fk_constraint('user_notification', 'stock_symbol_id', 'stock_symbol', 'stock_symbol_id');

create unique index stock_symbol_namex on stock_symbol (name, deleted) where deleted is null;
create index user_notification_user_account_idx on user_notification (user_account_id);
create index user_notification_stock_symbol_idx on user_notification (stock_symbol_id);
