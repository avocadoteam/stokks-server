alter table expo_settings
   add column enabled_notification boolean not null default true;

alter table expo_settings
   alter column enabled_notification drop default;