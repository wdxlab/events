import { BaseEmitter, EmitterOptions, FilterFn, Handler, MapFn } from './baseEmitter';
import { AggregateError } from './aggregateError';

export type AsyncHandler<TArg> = Handler<TArg, Promise<void>>;

export class AsyncEmitter<TInputArg, TOutputArg = TInputArg> extends BaseEmitter<
  TInputArg,
  TOutputArg,
  Promise<unknown[]>
> {
  constructor(options?: EmitterOptions<TInputArg, TOutputArg, Promise<unknown[]>>) {
    super(options);

    this.sourceEmitter?.on(async (arg) => {
      const result = await this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  async emit(arg: TInputArg): Promise<unknown[]> {
    if (this.isReadOnly) {
      throw new Error('Emitter is readonly');
    }

    return this.emitInt(arg);
  }

  protected async emitInt(arg: TInputArg): Promise<unknown[]> {
    if (this.filterFn && !this.filterFn(arg)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        if (this.mapFn) {
          await fn(this.mapFn(arg));
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await fn(arg as any);
        }
      } catch (e) {
        errors.push(e);
        if (this.isBailMode) {
          break;
        }
      }
    }

    return errors;
  }

  filter(filter: FilterFn<TOutputArg>): AsyncEmitter<TOutputArg, TOutputArg> {
    return new AsyncEmitter<TOutputArg, TOutputArg>({
      source: this,
      filter,
      bail: this.isBailMode,
    });
  }

  map<TNewArg>(mapFn: MapFn<TOutputArg, TNewArg>): AsyncEmitter<TOutputArg, TNewArg> {
    return new AsyncEmitter<TOutputArg, TNewArg>({
      source: this,
      map: mapFn,
      bail: this.isBailMode,
    });
  }
}
