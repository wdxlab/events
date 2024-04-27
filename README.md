# @WDXLab/Events

Rightly typed event emitter

[![npm version](https://badge.fury.io/js/%40wdxlab%2Fevents.svg)](https://badge.fury.io/js/%40wdxlab%2Fevents)

## Installation

```sh
npm install @wdxlab/events --save
```

## Usage

```ts
import Event from '@wdxlab/events';

const event = new Event<string, { foo: string }>();

event.on((arg, sender) => {
  console.log(arg); // hello
  console.log(sender); // sender ({ foo: 'bar' })
});

event.emit('hello', { foo: string });
```

Sender is optional and might be used as a reference to an object that emits an event.

### Events API

#### `on(handler): void`

Add event listener

#### `off(handler: Handler): void`

Remove specific event listener

#### `emit(arg, sender): unknown[]`

Emit event with some argument and sender reference

Return a list with subscribers errors

> learn more on `options.bail` section

#### `once(handler): Handler`

Add event listener that will be automatically removed after first call

Returns handler to remove handler manually

#### `for(filter): Event`

Creates an event that will only emit if an argument passes a filter

> learn more on `Filtering` section

#### `hasSubscriptions(): boolean`

Return `true` if an Event has any subscription

#### `clear(): void`

Remove all subscription from an Event

## Async Events

```ts
import { AsyncEvent } from '@wdxlab/events';
import { setTimeout } from 'node:timers/promises';

const event = new AsyncEvent<number>();

event.on(async ms => {
    console.log('before timer'); // 1
    await setTimeout(ms);
    console.log('after timer'); // 2
});

await event.emit(123);
console.log('after emit'); // 3
```

> also, sender is optional

### Async Events API

The same as for Events expect the `emit` method

#### emit(arg, sender): Promise<unknown[]>

Emit event with some argument and sender reference

Return a promise that resolves with a list of subscribers errors

## Filtering with options.filter

Allows listeners to filter events by some condition

```ts
import { Event, FilterableEvent } from '@wdxlab/events';

type Arg = { name: string };

const event = new Event<Arg>();
const appleEvent = event.for(arg => arg.name === 'Apple')
const orangeEvent = event.for(arg => arg.name === 'Orange')

event.on(arg => console.log('Global handler:', arg.name));
appleEvent.on(() => console.log('Apple handler'));
orangeEvent.on(() => console.log('Orangle handler'));

event.emit({ name: 'Apple' });
event.emit({ name: 'Banana' });
event.emit({ name: 'Orange' });
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

## Other Options

Sync and Async events has some useful options

### options.source

Allows to create readonly-events (can listen, but can't emit)

```ts
import Event from '@wdxlab/events';

const event = new Event<string>();
const readonly = new Event<string>({ source: event });

readonly.on((arg) => {
  console.log(arg); // hello
});

event.emit('hello'); // ✅
readonly.emit('hello'); // ❌ Error: Event is readonly
```

### options.bail

Controls how an event will react on error in some listener (`false` by default)

```ts
const event = new Event<string>();

event.on((arg) => console.log('1', arg));
event.on(() => {
    throw new Error('Some error');
});
event.on((arg) => console.log('3', arg));

const errors = event.emit('hello');

if (errors.length) {
    console.log('Something went wrong in some lestener')
}
```

The output is:
```
1 hello
3 hello
Something went wrong in some lestener
```

In other words: if any handler throws an error, other handlers WILL NOT be affected

When `true`, an event will stop calling any listeners if any of them throw an error.

```ts
const event = new Event<string>({ bail: true });

event.on((arg) => console.log('1', arg));
event.on(() => {
    throw new Error('Some error');
});
event.on((arg) => console.log('3', arg));

const errors = event.emit('hello');

if (errors.length) {
    console.log('Something went wrong in some lestener')
}
```

The output is:
```
1 hello
Something went wrong in some listener
```

In other words: if any handler throws an error, other handlers WILL BE affected
