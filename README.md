# @WDXLab/Events

Rightly typed event emitter for TS/JS

[![npm version](https://badge.fury.io/js/%40wdxlab%2Fevents.svg)](https://badge.fury.io/js/%40wdxlab%2Fevents)

## Installation

```sh
npm install @wdxlab/events --save
```

## Usage

```ts
import EventEmitter from '@wdxlab/events';

const event = new EventEmitter<Sender, Arg>();

event.on((sender, arg) => {
    console.log(sender); // sender
    console.log(arg); // arg
});

event.emit('sender', 'arg');
```

### More realistic use-case

```ts
import EventEmitter from '@wdxlab/events';

type EventStartArg = { foo: string };

class Foo {
    eventStart = new EventEmitter<Foo, EventStartArg>()

    start(foo: string) {
        this.eventStart.emit(this, {foo});
    }
}

const foo = new Foo()

foo.eventStart.on((sender, arg) => {
    console.log(sender); // foo instance
    console.log(arg); // { foo: 'bar' }
});

foo.start('bar');
```
