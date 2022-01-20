create table stock_symbol (
  stock_symbol_id bigserial,
  name varchar(8) not null,
  deleted timestamp,
  primary key (stock_symbol_id)
);

create table user_account (
  user_account_id serial,
  name varchar(256),
  pass_hash bytea not null,
  pass_salt bytea not null,
  primary key (user_account_id)
);

create table user_stocks_store (
  stock_symbol_id int8 not null,
  user_account_id int4 not null,
  primary key (stock_symbol_id, user_account_id)
);

create table user_notification (
  user_notification_id serial,
  trigger_name varchar(64) not null,
  trigger_param varchar(2) not null,
  trigger_value text not null,
  notify_interval interval not null,
  stock_symbol_id int8 not null,
  user_account_id int4 not null,
  deleted timestamp,
  primary key (user_notification_id)
);

