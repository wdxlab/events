import { BaseEmitter, EmitterOptions, FilterFn, MapFn } from './baseEmitter';
import { AggregateError } from './aggregateError';

export class Emitter<TInputArg, TOutputArg = TInputArg> extends BaseEmitter<
  TInputArg,
  TOutputArg,
  unknown[]
> {
  constructor(options?: EmitterOptions<TInputArg, TOutputArg, unknown[]>) {
    super(options);

    this.sourceEmitter?.on((arg) => {
      const result = this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  emit(arg: TInputArg): unknown[] {
    if (this.isReadOnly) {
      throw new Error('Emitter is readonly');
    }

    return this.emitInt(arg);
  }

  protected emitInt(arg: TInputArg): unknown[] {
    if (this.filterFn && !this.filterFn(arg)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        if (this.mapFn) {
          fn(this.mapFn(arg));
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fn(arg as any);
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

  filter(filter: FilterFn<TOutputArg>): Emitter<TOutputArg, TOutputArg> {
    return new Emitter<TOutputArg, TOutputArg>({
      source: this,
      filter,
      bail: this.isBailMode,
    });
  }

  map<TNewArg>(mapFn: MapFn<TOutputArg, TNewArg>): Emitter<TOutputArg, TNewArg> {
    return new Emitter<TOutputArg, TNewArg>({
      source: this,
      map: mapFn,
      bail: this.isBailMode,
    });
  }
}
