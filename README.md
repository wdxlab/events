# @WDXLab/Events

Rightly typed event emitter for TS/JS

[![npm version](https://badge.fury.io/js/%40wdxlab%2Fevents.svg)](https://badge.fury.io/js/%40wdxlab%2Fevents)

## Installation

```sh
npm install @wdxlab/events --save
```

## Usage

```ts
import Event from '@wdxlab/events';

const event = new Event<string, string>();

event.on((sender, arg) => {
  console.log(sender); // sender
  console.log(arg); // arg
});

event.emit('sender', 'arg');
```

### More realistic use-case

```ts
import Event from '@wdxlab/events';

type StartArg = { foo: string };

class Foo {
  eventStart = new Event<Foo, StartArg>();

  start(foo: string) {
    this.eventStart.emit(this, { foo });
  }
}

const foo = new Foo()

foo.eventStart.on((sender, arg) => {
  console.log(sender); // foo instance
  console.log(arg); // { foo: 'bar' }
});

foo.start('bar');
```

## Readonly Events 

If you're using an `Event` as a property of a class, there is a possibility to emit an `Event` from outside of a class:

```ts
import Event from '@wdxlab/events';

type StartArg = { foo: string };

class Foo {
  eventStart = new Event<Foo, StartArg>();
  
  start(foo: string) {
    this.eventStart.emit(this, { foo });
  }
}

const foo = new Foo()

foo.eventStart.emit(new Foo(), { foo:'bar' });
```

It may break some logic inside other listeners of `eventStart` because they may receive a different `sender` for the same event.

To fix it you can use `ReadonlyEvent`:

```ts
import Event, { ReadonlyEvent } from '@wdxlab/events';

type StartArg = { foo: string };

class Foo {
  private _eventStart = new Event<Foo, StartArg>();
  eventStart = new ReadonlyEvent(this._eventStart);
  
  start(foo: string) {
    this._eventStart.emit(this, { foo });
  }
}

const foo = new Foo()

foo.eventStart.emit(new Foo(), { foo:'bar' }); // Error: emit is not a function
```
