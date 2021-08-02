import * as events from 'events';
import { BusEvent, BusEventDto } from 'src/contracts/events/bus';

class ClientCallbackClass extends events.EventEmitter {
  constructor() {
    super();
  }

  emit<BE extends BusEvent>(event: BE, data: BusEventDto[BE]): boolean {
    return super.emit(event, data);
  }

  on<BE extends BusEvent>(event: BE, listener: (data: BusEventDto[BE]) => void): this {
    return super.on(event, listener);
  }
}

export const EventBus = new ClientCallbackClass();
