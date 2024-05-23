# @WDXLab/Events

Rightly typed event emitter

[![npm version](https://badge.fury.io/js/%40wdxlab%2Fevents.svg)](https://badge.fury.io/js/%40wdxlab%2Fevents)

## Installation

```sh
npm install @wdxlab/events --save
```

## Usage

```ts
import {Emitter} from '@wdxlab/events';

const emitter = new Emitter<string>();

emitter.on((arg) => {
  console.log(arg); // hello
});

emitter.emit('hello');
```

### Events API

#### `on(handler): void`

Add event listener

#### `off(handler: Handler): void`

Remove specific event listener

#### `emit(arg): unknown[]`

Emit event with some argument

Return a list with subscribers errors

> learn more on `options.bail` section

#### `once(handler): Handler`

Add event listener that will be automatically removed after first call

Returns handler to remove handler manually

#### `filter(filterFn): Event`

Creates an event emitter that will only emit if an argument passes a filter

> learn more on `Filtering` section

#### `map(mapFn): Event`

Creates an event emitter that will transform an argument with `mapFn` before emit

> learn more on `Mapping` section

#### `hasSubscriptions(): boolean`

Return `true` if an Event has any subscription

#### `clear(): void`

Remove all subscription from an Event

## Async Events

```ts
import { AsyncEmitter } from '@wdxlab/events';
import { setTimeout } from 'node:timers/promises';

const emitter = new AsyncEmitter<number>();

emitter.on(async ms => {
    console.log('before timer'); // 1
    await setTimeout(ms);
    console.log('after timer'); // 2
});

await emitter.emit(123);
console.log('after emit'); // 3
```

### Async Events API

The same as for Events expect the `emit` method

#### emit(arg): Promise<unknown[]>

Emit event with some argument

Return a promise that resolves with a list of subscribers errors

## Filtering with options.filter

Allows listeners to filter events by some condition

```ts
import { Emitter } from '@wdxlab/events';

type Arg = { name: string };

const emitter = new Emitter<Arg>();
const appleEvent = emitter.filter(arg => arg.name === 'Apple')
const orangeEvent = emitter.filter(arg => arg.name === 'Orange')

emitter.on(arg => console.log('Global handler:', arg.name));
appleEvent.on(() => console.log('Apple handler'));
orangeEvent.on(() => console.log('Orangle handler'));

emitter.emit({ name: 'Apple' });
emitter.emit({ name: 'Banana' });
emitter.emit({ name: 'Orange' });
```

The output is:
```
Global handler: Apple
Apple handler
Global handler: Banana
Global handler: Orange
Orange handler
```

> This also works for async events

## Mapping with options.map

Allows to transform an argument with some function before emit

```ts
type Arg = { fruit: { name: string } };

const emitter = new Emitter<Arg>();

emitter
    .map((arg) => arg.name)
    .on((arg) => console.log(arg));

emitter.emit({ name: 'Apple' });
emitter.emit({ name: 'Banana' });
emitter.emit({ name: 'Orange' });
```

The output is:
```
Apple
Banana
Orange
```

> This also works for async events

## Options

Sync and Async events has some useful options

- `source?: Emitter`
- `bail?: boolean`
- `filter?: FilterFn`
- `map?: MapFn`

### options.source

Allows to create readonly-events (can listen, but can't emit)

```ts
import { Emitter } from '@wdxlab/events';

const emitter = new Emitter<string>();
const readonly = new Emitter<string>({ source: emitter });

readonly.on((arg) => {
  console.log(arg); // hello
});

emitter.emit('hello'); // ✅
readonly.emit('hello'); // ❌ Error: Event is readonly
```

#### Readonly-event error handling

```ts
import { Emitter } from '@wdxlab/events';

const emitter = new Emitter<string>();
const readonly = new Emitter<string>({ source: emitter });

// ...

const error = emitter.emit('hello');

if (errors.length) {
    console.log('Something went wrong in some lestener');

    for (const aggregatedError of errors) {
        for (const error of aggregatedError.errors) {
            console.error(error);
        }
    }
}
```

### options.bail

Controls how an emitter will react on error in some listener (`false` by default)

```ts
const emitter = new Emitter<string>();

emitter.on((arg) => console.log('1', arg));
emitter.on(() => {
    throw new Error('Some error');
});
emitter.on((arg) => console.log('3', arg));

const errors = emitter.emit('hello');

if (errors.length) {
    console.log('Something went wrong in some lestener');
}
```

The output is:
```
1 hello
3 hello
Something went wrong in some lestener
```

In other words: if any handler throws an error, other handlers WILL NOT be affected

When `true`, an emitter will stop calling any listeners if any of them throw an error.

```ts
const emitter = new Emitter<string>({ bail: true });

emitter.on((arg) => console.log('1', arg));
emitter.on(() => {
    throw new Error('Some error');
});
emitter.on((arg) => console.log('3', arg));

const errors = emitter.emit('hello');

if (errors.length) {
    console.log('Something went wrong in some lestener');
}
```

The output is:
```
1 hello
Something went wrong in some listener
```

In other words: if any handler throws an error, other handlers WILL BE affected
