alter table user_notification 
  drop column price_match,
  add column trigger_name varchar(64) not null,
  add column trigger_param varchar(2) not null,
  add column trigger_value text not null;