export type Handler<TArg, TSender, TReturn> = (arg: TArg, sender: TSender) => TReturn;

export interface Emitable<TArg, TSender, TReturn> {
  emit(arg: TArg, sender: TSender): TReturn;
}

export type Filter<TArg, TSender> = (arg: TArg, sender: TSender) => boolean;

export interface Filterable<TArg, TSender, TReturn> {
  for(filter: Filter<TArg, TSender>): BaseEvent<TArg, TSender, TReturn>;
}

export type EventOptions<TArg, TSender, TEmitReturn> = {
  source?: BaseEvent<TArg, TSender, TEmitReturn>;
  bail?: boolean;
  filter?: Filter<TArg, TSender>;
};

export abstract class BaseEvent<TArg, TSender, TEmitReturn>
  implements Emitable<TArg, TSender, TEmitReturn>, Filterable<TArg, TSender, TEmitReturn>
{
  protected subscribers = new Set<Handler<TArg, TSender, unknown>>();
  readonly sourceEvent?: BaseEvent<TArg, TSender, TEmitReturn>;
  readonly filter?: Filter<TArg, TSender>;
  readonly isReadOnly: boolean = false;
  readonly isBailMode: boolean = false;

  protected constructor(options?: EventOptions<TArg, TSender, TEmitReturn>) {
    this.isBailMode = !!options?.bail;
    this.isReadOnly = !!options?.source;
    this.sourceEvent = options?.source;
    this.filter = options?.filter;
  }

  hasSubscriptions(): boolean {
    return this.subscribers.size > 0;
  }

  on(handler: Handler<TArg, TSender, unknown>): void {
    this.subscribers.add(handler);
  }

  once(handler: Handler<TArg, TSender, unknown>): Handler<TArg, TSender, unknown> {
    const wrapper: Handler<TArg, TSender, void> = (arg, sender) => {
      handler(arg, sender);
      this.off(wrapper);
    };

    this.on(wrapper);
    return wrapper;
  }

  off(handler: Handler<TArg, TSender, unknown>): void {
    this.subscribers.delete(handler);
  }

  abstract emit(arg: TArg, sender: TSender): TEmitReturn;
  abstract for(filter: Filter<TArg, TSender>): BaseEvent<TArg, TSender, TEmitReturn>;

  clear(): void {
    this.subscribers.clear();
  }
}
