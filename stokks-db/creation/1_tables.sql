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

