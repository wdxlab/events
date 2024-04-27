import { Event } from './event';

class Stub {
  foo = 'bar';
}

type EventArg = { foo: string };

test('add the listeners and emit', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg, Stub>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler);
  event.on(handler2);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg, stub);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg, stub);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg, stub);
});

test('add listener once', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg, Stub>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.once(handler);
  const onceHandler = event.once(handler2);

  event.off(onceHandler);

  event.emit(eventArg, stub);
  event.emit(eventArg, stub);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg, stub);
  expect(handler2).not.toHaveBeenCalled();
});

test('remove listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg, Stub>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg, stub);
  event.off(handler);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg, stub);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg, stub);
  expect(handler2).toBeCalledTimes(2);
  expect(handler2).toBeCalledWith(eventArg, stub);
});

test('clear listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg, Stub>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(eventArg, stub);
  event.clear();
  expect(event.hasSubscriptions()).toBe(false);
  event.emit(eventArg, stub);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg, stub);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg, stub);
});

test('modifying on emit', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg, Stub>();
  const handler = jest.fn(() => {
    event.off(handler);
  });
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(eventArg, stub);
  event.clear();
  expect(event.hasSubscriptions()).toBe(false);
  event.emit(eventArg, stub);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg, stub);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg, stub);
});

describe('errors', () => {
  test('non-bail', () => {
    const stub = new Stub();
    const eventArg: EventArg = { foo: 'hello' };
    const event = new Event<EventArg, Stub>();
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = event.emit(eventArg, stub);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('bail', () => {
    const stub = new Stub();
    const eventArg: EventArg = { foo: 'hello' };
    const event = new Event<EventArg, Stub>({ bail: true });
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = event.emit(eventArg, stub);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });
});

test('readonly mode', () => {
  const source = new Event<number, void>();
  const target = new Event<number, void>({ source });
  const handler1 = jest.fn();
  const handler2 = jest.fn(() => {
    throw new Error('Foo');
  });
  const handler3 = jest.fn();

  target.on(handler1);
  target.on(handler2);
  target.on(handler3);

  expect(() => target.emit(123)).toThrow('Event is readonly');

  const errors = source.emit(456);

  expect(errors).toHaveLength(1);
  expect(errors[0]).toBeInstanceOf(Error);
  expect(handler1).toBeCalledTimes(1);
  expect(handler2).toBeCalledTimes(1);
  expect(handler3).toBeCalledTimes(1);
});

test('filterable', () => {
  const event = new Event<{ name: string }, null>();
  const aaaFilter = event.for((arg) => arg.name === 'aaa');
  const bbbFilter = event.for((arg) => arg.name === 'bbb');
  const fooFilter = event.for((arg) => arg.name === 'foo');
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  event.on(handler1);
  aaaFilter.on(handler2);
  bbbFilter.on(handler2);
  fooFilter.on(handler2);

  event.emit({ name: 'ccc' }, null);
  event.emit({ name: 'ddd' }, null);
  event.emit({ name: 'foo' }, null);

  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
});
