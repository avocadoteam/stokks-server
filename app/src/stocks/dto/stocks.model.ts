import { HistoryPeriodTarget } from '@models';
import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class SearchModel {
  @IsString()
  @IsNotBlank()
  query: string;
}
export class TrendingModel {
  @IsNumber()
  @Max(8)
  @Min(1)
  count: number;
}
export class SymbolInfoModel {
  @IsString()
  @IsNotBlank()
  symbol: string;
}
export class SymbolHystoryModel extends SymbolInfoModel {
  @IsEnum(HistoryPeriodTarget)
  target: HistoryPeriodTarget;
}
