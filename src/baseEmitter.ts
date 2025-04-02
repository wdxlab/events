export type Handler<TArg, TReturn> = (arg: TArg) => TReturn;

export interface Emitable<TArg, TReturn> {
  emit(arg: TArg): TReturn;
}

export type FilterFn<TArg> = (arg: TArg) => boolean;
export type MapFn<TArg, TNewArg> = (arg: TArg) => TNewArg;

export interface Filterable<TInputArg, TReturn> {
  filter(filter: FilterFn<TInputArg>): BaseEmitter<TInputArg, TInputArg, TReturn>;
}

export interface Mappable<TArg, TReturn> {
  map<TNewArg>(mapFn: MapFn<TArg, TNewArg>): BaseEmitter<TArg, TNewArg, TReturn>;
}

export type EmitterOptions<TInputArg, TOutputArg, TEmitReturn> = {
  source?: BaseEmitter<any, TInputArg, TEmitReturn>;
  bail?: boolean;
  filter?: FilterFn<TInputArg>;
  map?: MapFn<TInputArg, TOutputArg>;
};

export abstract class BaseEmitter<TInputArg, TOutputArg, TEmitReturn>
  implements
    Emitable<TInputArg, TEmitReturn>,
    Filterable<TOutputArg, TEmitReturn>,
    Mappable<TOutputArg, TEmitReturn>
{
  protected subscribers = new Set<Handler<TOutputArg, unknown>>();
  protected sourceEmitter?: EmitterOptions<TInputArg, TOutputArg, TEmitReturn>['source'];
  readonly filterFn?: EmitterOptions<TInputArg, TOutputArg, TEmitReturn>['filter'];
  readonly mapFn?: EmitterOptions<TInputArg, TOutputArg, TEmitReturn>['map'];
  readonly isReadOnly: boolean;
  readonly isBailMode: boolean;

  protected constructor(options?: EmitterOptions<TInputArg, TOutputArg, TEmitReturn>) {
    this.isBailMode = !!options?.bail;
    this.isReadOnly = !!options?.source;
    this.sourceEmitter = options?.source;
    this.filterFn = options?.filter;
    this.mapFn = options?.map;
  }

  hasSubscriptions(): boolean {
    return this.subscribers.size > 0;
  }

  on(handler: Handler<TOutputArg, unknown>): void {
    this.subscribers.add(handler);
  }

  once(handler: Handler<TOutputArg, unknown>): Handler<TOutputArg, unknown> {
    const wrapper: Handler<TOutputArg, unknown> = (arg) => {
      const result = handler(arg);
      this.off(wrapper);
      return result;
    };

    this.on(wrapper);
    return wrapper;
  }

  off(handler: Handler<TOutputArg, unknown>): void {
    this.subscribers.delete(handler);
  }

  abstract emit(arg: TInputArg): TEmitReturn;
  abstract filter(
    filter: FilterFn<TOutputArg>,
  ): BaseEmitter<TOutputArg, TOutputArg, TEmitReturn>;
  abstract map<TNewArg>(
    mapFn: MapFn<TOutputArg, TNewArg>,
  ): BaseEmitter<TOutputArg, TNewArg, TEmitReturn>;

  clear(): void {
    this.subscribers.clear();
  }
}
