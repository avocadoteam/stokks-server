import { TriggerParam } from '@models';

export const resolveCondition = <T>(left: T, right: T, param: TriggerParam) => {
  switch (param) {
    case TriggerParam.Equals:
      return left === right;
    case TriggerParam.Greater:
      return left > right;
    case TriggerParam.GreaterOrEquals:
      return left >= right;
    case TriggerParam.Less:
      return left < right;
    case TriggerParam.LessOrEquals:
      return left <= right;
    case TriggerParam.NotEquals:
      return left !== right;
  }
};
