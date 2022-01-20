import { Controller, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('api/auth')
@ApiTags('Auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({ schema: { example: { data: { token: 'string', userId: 'number' } } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'number' },
        password: { type: 'string' },
      },
    },
  })
  login(@Req() req: Request) {
    return this.authService.login(
      req.user as {
        userId: number;
      },
    );
  }
}
