import { vi, expect, describe, test } from 'vitest';
import { Emitter } from './emitter.js';

type EventArg = { foo: string };

test('add the listeners and emit', () => {
  const emitterArg: EventArg = { foo: 'hello' };
  const emitter = new Emitter<EventArg>();
  const handler = vi.fn();
  const handler2 = vi.fn();

  emitter.on(handler);
  emitter.on(handler);
  emitter.on(handler2);
  expect(emitter.hasSubscriptions()).toBe(true);
  emitter.emit(emitterArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(emitterArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(emitterArg);
});

test('add listener once', () => {
  const emitterArg: EventArg = { foo: 'hello' };
  const emitter = new Emitter<EventArg>();
  const handler = vi.fn();
  const handler2 = vi.fn();

  emitter.once(handler);
  const onceHandler = emitter.once(handler2);

  emitter.off(onceHandler);

  emitter.emit(emitterArg);
  emitter.emit(emitterArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(emitterArg);
  expect(handler2).not.toHaveBeenCalled();
});

test('remove listeners', () => {
  const emitterArg: EventArg = { foo: 'hello' };
  const emitter = new Emitter<EventArg>();
  const handler = vi.fn();
  const handler2 = vi.fn();

  emitter.on(handler);
  emitter.on(handler2);
  expect(emitter.hasSubscriptions()).toBe(true);
  emitter.emit(emitterArg);
  emitter.off(handler);
  expect(emitter.hasSubscriptions()).toBe(true);
  emitter.emit(emitterArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(emitterArg);
  expect(handler2).toBeCalledTimes(2);
  expect(handler2).toBeCalledWith(emitterArg);
});

test('clear listeners', () => {
  const emitterArg: EventArg = { foo: 'hello' };
  const emitter = new Emitter<EventArg>();
  const handler = vi.fn();
  const handler2 = vi.fn();

  emitter.on(handler);
  emitter.on(handler2);
  emitter.emit(emitterArg);
  emitter.clear();
  expect(emitter.hasSubscriptions()).toBe(false);
  emitter.emit(emitterArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(emitterArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(emitterArg);
});

test('modifying on emit', () => {
  const emitterArg: EventArg = { foo: 'hello' };
  const emitter = new Emitter<EventArg>();
  const handler = vi.fn(() => {
    emitter.off(handler);
  });
  const handler2 = vi.fn();

  emitter.on(handler);
  emitter.on(handler2);
  emitter.emit(emitterArg);
  emitter.clear();
  expect(emitter.hasSubscriptions()).toBe(false);
  emitter.emit(emitterArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(emitterArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(emitterArg);
});

describe('errors', () => {
  test('non-bail', () => {
    const emitterArg: EventArg = { foo: 'hello' };
    const emitter = new Emitter<EventArg>();
    const handler1 = vi.fn();
    const handler2 = vi.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = vi.fn();

    emitter.on(handler1);
    emitter.on(handler2);
    emitter.on(handler3);

    const errors = emitter.emit(emitterArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('bail', () => {
    const emitterArg: EventArg = { foo: 'hello' };
    const emitter = new Emitter<EventArg>({ bail: true });
    const handler1 = vi.fn();
    const handler2 = vi.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = vi.fn();

    emitter.on(handler1);
    emitter.on(handler2);
    emitter.on(handler3);

    const errors = emitter.emit(emitterArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });
});

test('readonly mode', () => {
  const source = new Emitter<number>();
  const target = new Emitter<number>({ source });
  const handler1 = vi.fn();
  const handler2 = vi.fn(() => {
    throw new Error('Foo');
  });
  const handler3 = vi.fn();

  target.on(handler1);
  target.on(handler2);
  target.on(handler3);

  expect(() => target.emit(123)).toThrow('Emitter is readonly');

  const errors = source.emit(456);

  expect(errors).toHaveLength(1);
  expect(errors[0]).toBeInstanceOf(Error);
  expect(handler1).toBeCalledTimes(1);
  expect(handler2).toBeCalledTimes(1);
  expect(handler3).toBeCalledTimes(1);
});

test('filter', () => {
  const emitter = new Emitter<{ name: string }>();
  const aaaFilter = emitter.filter((arg) => arg.name === 'aaa');
  const bbbFilter = emitter.filter((arg) => arg.name === 'bbb');
  const fooFilter = emitter.filter((arg) => arg.name === 'foo');
  const handler1 = vi.fn();
  const handler2 = vi.fn();

  emitter.on(handler1);
  aaaFilter.on(handler2);
  bbbFilter.on(handler2);
  fooFilter.on(handler2);

  emitter.emit({ name: 'ccc' });
  emitter.emit({ name: 'ddd' });
  emitter.emit({ name: 'foo' });

  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
});

test('map', () => {
  type IArg = { event: { name: string }; source: { id: number } };
  const emitter = new Emitter<IArg>();
  const handler1 = vi.fn();

  emitter
    .filter((arg) => arg.source.id === 123)
    .map((arg) => arg.event)
    .filter((arg) => arg.name === 'foo')
    .map((arg) => arg.name)
    .on(handler1);

  emitter.emit({ source: { id: 123 }, event: { name: 'bar' } });
  emitter.emit({ source: { id: 456 }, event: { name: 'foo' } });
  emitter.emit({ source: { id: 123 }, event: { name: 'foo' } });

  expect(handler1.mock.calls).toMatchSnapshot();
});
