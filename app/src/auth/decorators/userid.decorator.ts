import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

export const UserId = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const [req] = context.getArgs<[Request]>();
  return req.user?.userId ?? 0;
});
