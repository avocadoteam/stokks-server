
create table expo_settings (
  expo_settings_id serial,
  user_account_id int4 not null,
  push_token bytea not null,
  primary key (expo_settings_id, user_account_id)
);

select schema_create_fk_constraint('expo_settings', 'user_account_id', 'user_account', 'user_account_id');
create index expo_settings_user_account_idx on expo_settings (user_account_id);