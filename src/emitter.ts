import { BaseEmitter, EmitterOptions, Filter } from './baseEmitter';
import { AggregateError } from './aggregateError';

export class Emitter<TArg> extends BaseEmitter<TArg, unknown[]> {
  constructor(options?: EmitterOptions<TArg, unknown[]>) {
    super(options);

    this.sourceEmitter?.on((arg) => {
      const result = this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  emit(arg: TArg): unknown[] {
    if (this.isReadOnly) {
      throw new Error('Emitter is readonly');
    }

    return this.emitInt(arg);
  }

  protected emitInt(arg: TArg): unknown[] {
    if (this.filter && !this.filter(arg)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        fn(arg);
      } catch (e) {
        errors.push(e);
        if (this.isBailMode) {
          break;
        }
      }
    }

    return errors;
  }

  for(filter: Filter<TArg>): Emitter<TArg> {
    return new Emitter<TArg>({ source: this, filter, bail: this.isBailMode });
  }
}
