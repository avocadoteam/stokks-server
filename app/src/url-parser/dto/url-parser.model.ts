import { IsString, IsUrl } from 'class-validator';
import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class UrlParserModel {
  @IsString()
  @IsNotBlank()
  @IsUrl()
  link: string;
}
