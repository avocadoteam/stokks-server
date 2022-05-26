create table temp_expo_settings (
  expo_settings_id serial,
  user_account_id int4 not null,
  push_token bytea not null,
  device text,
  primary key (expo_settings_id)
);

insert into temp_expo_settings select expo_settings_id, user_account_id, push_token from expo_settings;

drop table expo_settings;
drop index if exists expo_settings_user_account_idx;

create table expo_settings (
  expo_settings_id serial,
  user_account_id int4 not null,
  push_token bytea not null,
  device text,
  primary key (expo_settings_id)
);
select schema_create_fk_constraint('expo_settings', 'user_account_id', 'user_account', 'user_account_id');
create index expo_settings_user_account_idx on expo_settings (user_account_id);

insert into expo_settings select expo_settings_id, user_account_id, push_token from temp_expo_settings;

drop table temp_expo_settings;