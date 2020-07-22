import EventEmitter from './EventEmitter';

class Stub {
  foo = 'bar';
}

type EventArg = { foo: string };

test('should emit', () => {
  const stub = new Stub();
  const eventArg: EventArg = { foo: 'hello' };
  const event = new EventEmitter<Stub, EventArg>();
  event.on((sender, arg) => {
    expect(sender).toBe(stub);
    expect(arg).toStrictEqual(arg);
  });

  event.emit(stub, eventArg);
});
