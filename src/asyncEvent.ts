import { BaseEvent, EventOptions, Filter, Handler } from './baseEvent';
import { AggregateError } from './aggregateError';

export type AsyncHandler<TArg, TSender> = Handler<TArg, TSender, Promise<void>>;

export class AsyncEvent<TArg, TSender = void> extends BaseEvent<
  TArg,
  TSender,
  Promise<unknown[]>
> {
  constructor(options?: EventOptions<TArg, TSender, Promise<unknown[]>>) {
    super(options);

    this.sourceEvent?.on(async (arg, sender) => {
      const result = await this.emitInt(arg, sender);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  async emit(arg: TArg, sender: TSender): Promise<unknown[]> {
    if (this.isReadOnly) {
      throw new Error('Event is readonly');
    }

    return this.emitInt(arg, sender);
  }

  protected async emitInt(arg: TArg, sender: TSender): Promise<unknown[]> {
    if (this.filter && !this.filter(arg, sender)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        await fn.call(sender, arg, sender);
      } catch (e) {
        errors.push(e);
        if (this.isBailMode) {
          break;
        }
      }
    }

    return errors;
  }

  for(filter: Filter<TArg, TSender>): AsyncEvent<TArg, TSender> {
    return new AsyncEvent<TArg, TSender>({ bail: this.isBailMode, filter, source: this });
  }
}
