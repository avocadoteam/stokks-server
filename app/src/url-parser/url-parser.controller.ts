import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @ApiOperation({ summary: 'Consumes article link and returns img from meta og:image' })
  @ApiResponse({ schema: { example: { data: { imgUrl: 'string' } } }, status: 200 })
  @ApiResponse({ description: 'if link is blank or not valid url', status: 400 })
  @ApiBody({ schema: { example: { link: 'string' } } })
  @Post()
  getInfo(@Body() model: UrlParserDto) {
    return this.up.getArticleImg(model.link);
  }
}
