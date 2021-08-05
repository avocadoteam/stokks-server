import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secretKey: process.env.JWT_SECRET_KEY,
  issuer: process.env.JWT_ISSUER,
}));
