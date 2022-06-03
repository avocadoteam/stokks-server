import { HistoryPeriodTarget, SearchModel, SymbolHystoryModel, SymbolInfoModel, TrendingModel } from '@models';
import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class SearchDto implements SearchModel {
  @IsString()
  @IsNotBlank()
  query: string;
}
export class TrendingDto implements TrendingModel {
  @IsNumber()
  @Max(128)
  @Min(1)
  count: number;
}
export class SymbolInfoDto implements SymbolInfoModel {
  @IsString()
  @IsNotBlank()
  symbol: string;
}
export class SymbolHystoryDto extends SymbolInfoDto implements SymbolHystoryModel {
  @IsEnum(HistoryPeriodTarget)
  target: HistoryPeriodTarget;
}
