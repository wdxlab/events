import Event, { Handler } from './Event';

export default class ReadonlyEvent<TSender, TArg> {
  private targetEvent: Event<TSender, TArg>;

  constructor(targetEvent: Event<TSender, TArg>) {
    this.targetEvent = targetEvent;
  }

  get subscriptionsCount(): number {
    return this.targetEvent.subscriptionsCount;
  }

  on(handler: Handler<TSender, TArg>): void {
    this.targetEvent.on(handler);
  }

  off(handler: Handler<TSender, TArg>): void {
    this.targetEvent.off(handler);
  }

  clear(): void {
    this.targetEvent.clear();
  }
}
