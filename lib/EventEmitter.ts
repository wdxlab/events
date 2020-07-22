export type Handler<TSender, TArg> = (sender: TSender, arg: TArg) => void;

export default class EventEmitter<TSender, TArg> {
  private subscribers: Handler<TSender, TArg>[];

  constructor() {
    this.subscribers = [];
  }

  get subscriptionsCount(): number {
    return this.subscribers.length;
  }

  on(handler: Handler<TSender, TArg>): void {
    if (!this.subscribers.includes(handler)) {
      this.subscribers.push(handler);
    }
  }

  off(handler: Handler<TSender, TArg>): void {
    const ix = this.subscribers.indexOf(handler);

    if (ix > -1) {
      this.subscribers.splice(ix, 1);
    }
  }

  emit(sender: TSender, arg: TArg): void {
    for (const fn of this.subscribers) {
      fn.call(sender, sender, arg);
    }
  }

  clear(): void {
    this.subscribers.length = 0;
  }
}
