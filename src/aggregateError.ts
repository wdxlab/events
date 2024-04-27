export class AggregateError extends Error {
  constructor(readonly errors: unknown[]) {
    super('Some handlers has errors');
  }
}
