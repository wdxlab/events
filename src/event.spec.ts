import { Event } from './event';

type EventArg = { foo: string };

test('add the listeners and emit', () => {
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler);
  event.on(handler2);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg);
});

test('add listener once', () => {
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.once(handler);
  const onceHandler = event.once(handler2);

  event.off(onceHandler);

  event.emit(eventArg);
  event.emit(eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg);
  expect(handler2).not.toHaveBeenCalled();
});

test('remove listeners', () => {
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg);
  event.off(handler);
  expect(event.hasSubscriptions()).toBe(true);
  event.emit(eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg);
  expect(handler2).toBeCalledTimes(2);
  expect(handler2).toBeCalledWith(eventArg);
});

test('clear listeners', () => {
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(eventArg);
  event.clear();
  expect(event.hasSubscriptions()).toBe(false);
  event.emit(eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg);
});

test('modifying on emit', () => {
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<EventArg>();
  const handler = jest.fn(() => {
    event.off(handler);
  });
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(eventArg);
  event.clear();
  expect(event.hasSubscriptions()).toBe(false);
  event.emit(eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(eventArg);
});

describe('errors', () => {
  test('non-bail', () => {
    const eventArg: EventArg = { foo: 'hello' };
    const event = new Event<EventArg>();
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = event.emit(eventArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('bail', () => {
    const eventArg: EventArg = { foo: 'hello' };
    const event = new Event<EventArg>({ bail: true });
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = event.emit(eventArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });
});

test('readonly mode', () => {
  const source = new Event<number>();
  const target = new Event<number>({ source });
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
  const event = new Event<{ name: string }>();
  const aaaFilter = event.for((arg) => arg.name === 'aaa');
  const bbbFilter = event.for((arg) => arg.name === 'bbb');
  const fooFilter = event.for((arg) => arg.name === 'foo');
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  event.on(handler1);
  aaaFilter.on(handler2);
  bbbFilter.on(handler2);
  fooFilter.on(handler2);

  event.emit({ name: 'ccc' });
  event.emit({ name: 'ddd' });
  event.emit({ name: 'foo' });

  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
});
