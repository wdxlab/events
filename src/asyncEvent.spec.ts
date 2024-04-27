import { AsyncEvent } from './asyncEvent';

it('should work', async () => {
  const event = new AsyncEvent<{ name: string }, null>();
  const handler = jest.fn(() => new Promise((r) => setTimeout(r, 500)));
  const handler2 = jest.fn(() => new Promise((r) => setTimeout(r, 200)));

  event.on(handler);
  event.on(handler2);

  await event.emit({ name: 'foo' }, null);
  expect(handler.mock.calls).toMatchSnapshot();
  expect(handler.mock.results).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  expect(handler2.mock.results).toMatchSnapshot();

  await event.emit({ name: 'bar' }, null);
  expect(handler.mock.calls).toMatchSnapshot();
  expect(handler.mock.results).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  expect(handler2.mock.results).toMatchSnapshot();
});

describe('error', () => {
  test('non-bail', async () => {
    const eventArg = { foo: 'hello' };
    const event = new AsyncEvent<{ foo: string }, void>();
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = await event.emit(eventArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('bail', async () => {
    const eventArg = { foo: 'hello' };
    const event = new AsyncEvent<{ foo: string }, void>({ bail: true });
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    event.on(handler1);
    event.on(handler2);
    event.on(handler3);

    const errors = await event.emit(eventArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });
});

test('readonly mode', async () => {
  const source = new AsyncEvent<number, void>();
  const target = new AsyncEvent<number, void>({ source });
  const handler1 = jest.fn();
  const handler2 = jest.fn(() => {
    throw new Error('Foo');
  });
  const handler3 = jest.fn();

  target.on(handler1);
  target.on(handler2);
  target.on(handler3);

  await expect(target.emit(123)).rejects.toThrow('Event is readonly');

  const errors = await source.emit(456);

  expect(errors).toHaveLength(1);
  expect(errors[0]).toBeInstanceOf(Error);
  expect(handler1).toBeCalledTimes(1);
  expect(handler2).toBeCalledTimes(1);
  expect(handler3).toBeCalledTimes(1);
});

it('filterable', async () => {
  const event = new AsyncEvent<{ name: string }, null>();
  const aaaFilter = event.for((arg) => arg.name === 'aaa');
  const bbbFilter = event.for((arg) => arg.name === 'bbb');
  const fooFilter = event.for((arg) => arg.name === 'foo');
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  event.on(handler1);
  aaaFilter.on(handler2);
  bbbFilter.on(handler2);
  fooFilter.on(handler2);

  await event.emit({ name: 'ccc' }, null);
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  await event.emit({ name: 'ddd' }, null);
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  await event.emit({ name: 'foo' }, null);
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
});
