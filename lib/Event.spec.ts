import Event from './Event';

class Stub {
  foo = 'bar';
}

type EventArg = { foo: string };

test('add the listeners and emit', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<Stub, EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler);
  event.on(handler2);
  expect(event.subscriptionsCount).toBe(2);
  event.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(stub, eventArg);
});

test('remove listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<Stub, EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  expect(event.subscriptionsCount).toBe(2);
  event.emit(stub, eventArg);
  event.off(handler);
  expect(event.subscriptionsCount).toBe(1);
  event.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(2);
  expect(handler2).toBeCalledWith(stub, eventArg);
});

test('clear listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<Stub, EventArg>();
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(stub, eventArg);
  event.clear();
  expect(event.subscriptionsCount).toBe(0);
  event.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(stub, eventArg);
});

test('modifying on emit', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new Event<Stub, EventArg>();
  const handler = jest.fn(() => {
    event.off(handler);
  });
  const handler2 = jest.fn();
  const handler3 = jest.fn();

  event.on(handler);
  event.on(handler2);
  event.emit(stub, eventArg);
  event.clear();
  expect(event.subscriptionsCount).toBe(0);
  event.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(stub, eventArg);
});
