import { BaseEvent, EventOptions, Filter, Handler } from './baseEvent';
import { AggregateError } from './aggregateError';

export type AsyncHandler<TArg> = Handler<TArg, Promise<void>>;

export class AsyncEvent<TArg> extends BaseEvent<TArg, Promise<unknown[]>> {
  constructor(options?: EventOptions<TArg, Promise<unknown[]>>) {
    super(options);

    this.sourceEvent?.on(async (arg) => {
      const result = await this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  async emit(arg: TArg): Promise<unknown[]> {
    if (this.isReadOnly) {
      throw new Error('Event is readonly');
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

  for(filter: Filter<TArg>): AsyncEvent<TArg> {
    return new AsyncEvent<TArg>({ bail: this.isBailMode, filter, source: this });
  }
}
