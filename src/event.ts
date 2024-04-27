import { BaseEvent, EventOptions, Filter } from './baseEvent';
import { AggregateError } from './aggregateError';

export class Event<TArg, TSender = void> extends BaseEvent<TArg, TSender, unknown[]> {
  constructor(options?: EventOptions<TArg, TSender, unknown[]>) {
    super(options);

    this.sourceEvent?.on((arg, sender) => {
      const result = this.emitInt(arg, sender);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  emit(arg: TArg, sender: TSender): unknown[] {
    if (this.isReadOnly) {
      throw new Error('Event is readonly');
    }

    return this.emitInt(arg, sender);
  }

  protected emitInt(arg: TArg, sender: TSender): unknown[] {
    if (this.filter && !this.filter(arg, sender)) {
      return [];
    }

    const errors: unknown[] = [];

    for (const fn of this.subscribers) {
      try {
        fn.call(sender, arg, sender);
      } catch (e) {
        errors.push(e);
        if (this.isBailMode) {
          break;
        }
      }
    }

    return errors;
  }

  for(filter: Filter<TArg, TSender>): Event<TArg, TSender> {
    return new Event<TArg, TSender>({ source: this, filter, bail: this.isBailMode });
  }
}
