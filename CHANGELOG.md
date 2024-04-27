## next

Total refactoring

### Breaking

- remove `ReadonlyEvent`
- swap Sender and Arg argument position
- no throw exception on emit

### Features

- Event `for(filter)`-method
- Event options:
  - source - source for an event (readonly event alternative)
  - bail - event reaction on any listener error
  - filter - event only emit if an argument passes a filter

> see [README.md](README.md) for examples

## 1.1.0 (24 Jule 2020)

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
