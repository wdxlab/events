export type Handler<TSender, TArg> = (sender: TSender, arg: TArg) => void;

export default class Event<TSender, TArg> {
  private subscribers: Set<Handler<TSender, TArg>> = new Set();

  get subscriptionsCount(): number {
    return this.subscribers.size;
  }

  on(handler: Handler<TSender, TArg>): void {
    this.subscribers.add(handler);
  }

  off(handler: Handler<TSender, TArg>): void {
    this.subscribers.delete(handler);
  }

  emit(sender: TSender, arg: TArg): void {
    for (const fn of this.subscribers) {
      fn.call(sender, sender, arg);
    }
  }

  clear(): void {
    this.subscribers.clear();
  }
}
