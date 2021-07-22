import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    console.debug(join(__dirname, '../../..', 'public'));
    return res.sendFile(join(__dirname, '../../..', 'public') + '/index.html');
  }
}
