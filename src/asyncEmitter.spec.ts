import { AsyncEmitter } from './asyncEmitter';

it('should work', async () => {
  const emitter = new AsyncEmitter<{ name: string }>();
  const handler = jest.fn(() => new Promise((r) => setTimeout(r, 500)));
  const handler2 = jest.fn(() => new Promise((r) => setTimeout(r, 200)));

  emitter.on(handler);
  emitter.on(handler2);

  await emitter.emit({ name: 'foo' });
  expect(handler.mock.calls).toMatchSnapshot();
  expect(handler.mock.results).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  expect(handler2.mock.results).toMatchSnapshot();

  await emitter.emit({ name: 'bar' });
  expect(handler.mock.calls).toMatchSnapshot();
  expect(handler.mock.results).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  expect(handler2.mock.results).toMatchSnapshot();
});

describe('error', () => {
  test('non-bail', async () => {
    const emitterArg = { foo: 'hello' };
    const emitter = new AsyncEmitter<{ foo: string }>();
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    emitter.on(handler1);
    emitter.on(handler2);
    emitter.on(handler3);

    const errors = await emitter.emit(emitterArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(1);
  });

  test('bail', async () => {
    const emitterArg = { foo: 'hello' };
    const emitter = new AsyncEmitter<{ foo: string }>({ bail: true });
    const handler1 = jest.fn();
    const handler2 = jest.fn(() => {
      throw new Error('Foo');
    });
    const handler3 = jest.fn();

    emitter.on(handler1);
    emitter.on(handler2);
    emitter.on(handler3);

    const errors = await emitter.emit(emitterArg);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(handler1).toBeCalledTimes(1);
    expect(handler2).toBeCalledTimes(1);
    expect(handler3).toBeCalledTimes(0);
  });
});

test('readonly mode', async () => {
  const source = new AsyncEmitter<number>();
  const target = new AsyncEmitter<number>({ source });
  const handler1 = jest.fn();
  const handler2 = jest.fn(() => {
    throw new Error('Foo');
  });
  const handler3 = jest.fn();

  target.on(handler1);
  target.on(handler2);
  target.on(handler3);

  await expect(target.emit(123)).rejects.toThrow('Emitter is readonly');

  const errors = await source.emit(456);

  expect(errors).toHaveLength(1);
  expect(errors[0]).toBeInstanceOf(Error);
  expect(handler1).toBeCalledTimes(1);
  expect(handler2).toBeCalledTimes(1);
  expect(handler3).toBeCalledTimes(1);
});

it('filterable', async () => {
  const emitter = new AsyncEmitter<{ name: string }>();
  const aaaFilter = emitter.filter((arg) => arg.name === 'aaa');
  const bbbFilter = emitter.filter((arg) => arg.name === 'bbb');
  const fooFilter = emitter.filter((arg) => arg.name === 'foo');
  const handler1 = jest.fn();
  const handler2 = jest.fn();

  emitter.on(handler1);
  aaaFilter.on(handler2);
  bbbFilter.on(handler2);
  fooFilter.on(handler2);

  await emitter.emit({ name: 'ccc' });
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  await emitter.emit({ name: 'ddd' });
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
  await emitter.emit({ name: 'foo' });
  expect(handler1.mock.calls).toMatchSnapshot();
  expect(handler2.mock.calls).toMatchSnapshot();
});

test('map', async () => {
  type IArg = { event: { name: string }; source: { id: number } };
  const emitter = new AsyncEmitter<IArg>();
  const handler1 = jest.fn();

  emitter
    .filter((arg) => arg.source.id === 123)
    .map((arg) => arg.event)
    .filter((arg) => arg.name === 'foo')
    .map((arg) => arg.name)
    .on(handler1);

  await emitter.emit({ source: { id: 123 }, event: { name: 'bar' } });
  await emitter.emit({ source: { id: 456 }, event: { name: 'foo' } });
  await emitter.emit({ source: { id: 123 }, event: { name: 'foo' } });

  expect(handler1.mock.calls).toMatchSnapshot();
});
