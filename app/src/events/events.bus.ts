import { Logger } from '@nestjs/common';
import * as events from 'events';
import { BusEvent, BusEventDto } from 'src/contracts/events/bus';

class ClientCallbackClass extends events.EventEmitter {
  private readonly logger = new Logger(ClientCallbackClass.name);
  constructor() {
    super();
  }

  emit<BE extends BusEvent>(event: BE, data: BusEventDto[BE]): boolean {
    this.logger.debug(event);
    return super.emit(event, data);
  }

  on<BE extends BusEvent>(event: BE, listener: (data: BusEventDto[BE]) => void): this {
    return super.on(event, listener);
  }
}

export const EventBus = new ClientCallbackClass();
