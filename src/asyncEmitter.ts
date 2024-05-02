import { BaseEmitter, EmitterOptions, Filter, Handler } from './baseEmitter';
import { AggregateError } from './aggregateError';

export type AsyncHandler<TArg> = Handler<TArg, Promise<void>>;

export class AsyncEmitter<TArg> extends BaseEmitter<TArg, Promise<unknown[]>> {
  constructor(options?: EmitterOptions<TArg, Promise<unknown[]>>) {
    super(options);

    this.sourceEmitter?.on(async (arg) => {
      const result = await this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  async emit(arg: TArg): Promise<unknown[]> {
    if (this.isReadOnly) {
      throw new Error('Emitter is readonly');
    }

    return this.emitInt(arg);
  }

  protected async emitInt(arg: TArg): Promise<unknown[]> {
    if (this.filter && !this.filter(arg)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        await fn(arg);
      } catch (e) {
        errors.push(e);
        if (this.isBailMode) {
          break;
        }
      }
    }

    return errors;
  }

  for(filter: Filter<TArg>): AsyncEmitter<TArg> {
    return new AsyncEmitter<TArg>({ bail: this.isBailMode, filter, source: this });
  }
}
