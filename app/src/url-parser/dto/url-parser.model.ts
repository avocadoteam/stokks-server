import { UrlParserModel } from '@models';
import { IsString, IsUrl } from 'class-validator';
import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class UrlParserDto implements UrlParserModel {
  @IsString()
  @IsNotBlank()
  @IsUrl()
  link: string;
}
