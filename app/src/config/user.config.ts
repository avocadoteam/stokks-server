import { registerAs } from '@nestjs/config';

export const userConfig = registerAs('user', () => ({
  userName: process.env.U_NAME,
  userPass: process.env.U_PASS,
}));
