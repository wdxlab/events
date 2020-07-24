import Event from './Event';
import ReadonlyEvent from './ReadonlyEvent';

class Stub {
  foo = 'bar';
}

type EventArg = { foo: string };

test('add the listeners and react to target', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const targetEvent = new Event<Stub, EventArg>();
  const event = new ReadonlyEvent(targetEvent);
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler);
  event.on(handler2);
  expect(event.subscriptionsCount).toBe(2);
  targetEvent.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(stub, eventArg);
});

test('remove listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const targetEvent = new Event<Stub, EventArg>();
  const event = new ReadonlyEvent(targetEvent);
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  expect(event.subscriptionsCount).toBe(2);
  targetEvent.emit(stub, eventArg);
  event.off(handler);
  expect(event.subscriptionsCount).toBe(1);
  targetEvent.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(2);
  expect(handler2).toBeCalledWith(stub, eventArg);
});

test('clear listeners', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const targetEvent = new Event<Stub, EventArg>();
  const event = new ReadonlyEvent(targetEvent);
  const handler = jest.fn();
  const handler2 = jest.fn();

  event.on(handler);
  event.on(handler2);
  targetEvent.emit(stub, eventArg);
  event.clear();
  expect(event.subscriptionsCount).toBe(0);
  targetEvent.emit(stub, eventArg);

  expect(handler).toBeCalledTimes(1);
  expect(handler).toBeCalledWith(stub, eventArg);
  expect(handler2).toBeCalledTimes(1);
  expect(handler2).toBeCalledWith(stub, eventArg);
});
