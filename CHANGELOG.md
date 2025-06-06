## 3.0.0 (02 April 2025)

This package is ESM now

## 2.0.0 (10 July 2024)

Total refactoring

### Breaking

- rename `Event` into `Emitter` and `AsyncEvent` into `AsyncEmitter`
- remove `ReadonlyEvent`
- remove sender
- no throw exception on emit, return errors list instead

### Features

- Event `filter(fn)`-method
- Event `map(fn)`-method
- Event options:
  - `source` - source for an event (readonly event alternative)
  - `bail` - event reaction on any listener error
  - `filter` - event only emit if an argument passes a filter
  - `map` - transform an argument before emit

> see [README.md](README.md) for examples

## 1.1.0 (24 July 2020)

### Feature

- add `ReadonlyEvent`

### Fix

- fix case with removing a listener till emitting

## 1.0.4 (22 Jule 2020)

- fix: build for nodejs

## 1.0.3 (22 Jule 2020)

- fix: package.json `types` field

## 1.0.2 (22 Jule 2020)

- refactor: rename `Emitter` to `Event` (not breaking cause exporting default)

## 1.0.1 (22 Jule 2020)

- refactor: rename `EventEmitter` to `Emitter` (not breaking cause exporting default)

## 1.0.0 (22 Jule 2020)

- initial release
