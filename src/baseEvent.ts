export type Handler<TArg, TReturn> = (arg: TArg) => TReturn;

export interface Emitable<TArg, TReturn> {
  emit(arg: TArg): TReturn;
}

export type Filter<TArg> = (arg: TArg) => boolean;

export interface Filterable<TArg, TReturn> {
  for(filter: Filter<TArg>): BaseEvent<TArg, TReturn>;
}

export type EventOptions<TArg, TEmitReturn> = {
  source?: BaseEvent<TArg, TEmitReturn>;
  bail?: boolean;
  filter?: Filter<TArg>;
};

export abstract class BaseEvent<TArg, TEmitReturn>
  implements Emitable<TArg, TEmitReturn>, Filterable<TArg, TEmitReturn>
{
  protected subscribers = new Set<Handler<TArg, unknown>>();
  readonly sourceEvent?: BaseEvent<TArg, TEmitReturn>;
  readonly filter?: Filter<TArg>;
  readonly isReadOnly: boolean = false;
  readonly isBailMode: boolean = false;

  protected constructor(options?: EventOptions<TArg, TEmitReturn>) {
    this.isBailMode = !!options?.bail;
    this.isReadOnly = !!options?.source;
    this.sourceEvent = options?.source;
    this.filter = options?.filter;
  }

  hasSubscriptions(): boolean {
    return this.subscribers.size > 0;
  }

  on(handler: Handler<TArg, unknown>): void {
    this.subscribers.add(handler);
  }

  once(handler: Handler<TArg, unknown>): Handler<TArg, unknown> {
    const wrapper: Handler<TArg, void> = (arg) => {
      handler(arg);
      this.off(wrapper);
    };

    this.on(wrapper);
    return wrapper;
  }

  off(handler: Handler<TArg, unknown>): void {
    this.subscribers.delete(handler);
  }

  abstract emit(arg: TArg): TEmitReturn;
  abstract for(filter: Filter<TArg>): BaseEvent<TArg, TEmitReturn>;

  clear(): void {
    this.subscribers.clear();
  }
}
