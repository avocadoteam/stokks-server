delete from user_stocks_store;
delete from user_notification;
delete from user_account;

alter table user_account
   add column pass_hash bytea not null,
   add column pass_salt bytea not null;