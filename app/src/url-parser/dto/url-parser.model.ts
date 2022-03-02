import { UrlParserModel } from '@models';
import { IsArray, IsString } from 'class-validator';

export class UrlParserDto implements UrlParserModel {
  @IsArray()
  @IsString({ each: true })
  links: string[];
}
