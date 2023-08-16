/** Function that transforms a value. */
export interface Transformer<I, O> {
  (input: I): Promise<O>
}

/**
 * Transform stream that will transform values concurrently up to the specified
 * amount. Note: does _not_ preserve ordering.
 */
export declare class Parallel<I = any, O = any> extends TransformStream<I, O> {
  /**
   * @param concurrency Number of transforms to run concurrently.
   * @param transformer Function that transforms a value.
   * @param writableStrategy An object that optionally defines a queuing strategy for the stream.
   * @param readableStrategy An object that optionally defines a queuing strategy for the stream.
   */
  constructor (concurrency: number, transformer: Transformer<I, O>, writableStrategy?: QueuingStrategy<I>, readableStrategy?: QueuingStrategy<O>)
}
