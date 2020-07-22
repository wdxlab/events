# @WDXLab/Events

Rightly typed event emitter for TS/JS

[![npm version](https://badge.fury.io/js/%40wdxlab%2Fevents.svg)](https://badge.fury.io/js/%40wdxlab%2Fevents)

## Installation

```sh
npm install @wdxlab/events --save
```

## Usage

```ts
import Emitter from '@wdxlab/events';

const emitter = new Emitter<Sender, Arg>();

emitter.on((sender, arg) => {
    console.log(sender); // sender
    console.log(arg); // arg
});

emitter.emit('sender', 'arg');
```

### More realistic use-case

```ts
import Emitter from '@wdxlab/events';

type StartArg = { foo: string };

class Foo {
    emitterStart = new Emitter<Foo, StartArg>()

    start(foo: string) {
        this.emitterStart.emit(this, {foo});
    }
}

const foo = new Foo()

foo.emitterStart.on((sender, arg) => {
    console.log(sender); // foo instance
    console.log(arg); // { foo: 'bar' }
});

foo.start('bar');
```
