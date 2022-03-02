import { Body, Controller, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { UrlParserDto } from './dto/url-parser.model';
import { UrlParserService } from './url-parser.service';

@ApiTags('Url parse')
@Controller('api/url-parse')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class UrlParserController {
  constructor(private readonly up: UrlParserService) {}

  @ApiOperation({ summary: 'Consumes article links and returns imgs from meta og:image' })
  @ApiResponse({ description: 'if link is blank or not valid url', status: 400 })
  @ApiBody({ schema: { example: { links: ['string'] } } })
  @ApiBearerAuth()
  @Post()
  async getInfo(@Body() model: UrlParserDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    await this.up.getArticleImgs(model.links, res);
  }
}
