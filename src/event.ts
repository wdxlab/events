import { BaseEvent, EventOptions, Filter } from './baseEvent';
import { AggregateError } from './aggregateError';

export class Event<TArg> extends BaseEvent<TArg, unknown[]> {
  constructor(options?: EventOptions<TArg, unknown[]>) {
    super(options);

    this.sourceEvent?.on((arg) => {
      const result = this.emitInt(arg);
      if (result.length) {
        throw new AggregateError(result);
      }
    });
  }

  emit(arg: TArg): unknown[] {
    if (this.isReadOnly) {
      throw new Error('Event is readonly');
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

  for(filter: Filter<TArg>): Event<TArg> {
    return new Event<TArg>({ source: this, filter, bail: this.isBailMode });
  }
}
