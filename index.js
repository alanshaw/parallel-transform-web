/**
 * @template I
 * @template O
 * @extends {TransformStream<I, O>}
 */
export class Parallel extends TransformStream {
  /**
   * @param {number} concurrency
   * @param {(input: I) => Promise<O>} transformer
   * @param {QueuingStrategy<I>} [writableStrategy]
   * @param {QueuingStrategy<O>} [readableStrategy]
   */
  constructor (concurrency, transformer, writableStrategy, readableStrategy) {
    let pending = 0
    /** @type {(() => void|undefined)|null} */
    let onNext = null
    /** @type {(() => void|undefined)|null} */
    let onIdle = null
    super({
      transform (input, controller) {
        pending++
        transformer(input)
          .then(value => {
            controller.enqueue(value)
            pending--
            if (onNext) {
              onNext()
              onNext = null
            }
            if (pending === 0 && onIdle) {
              return onIdle()
            }
          })
          .catch(error => controller.error(error))
        // if at concurrency limit, wait for a pending task to complete
        if (pending === concurrency) {
          // returning a promise here prevents transform from being called
          // again until it resolves i.e. backpressure
          return new Promise(resolve => { onNext = resolve })
        }
      },
      flush () {
        if (pending !== 0) {
          return new Promise(resolve => { onIdle = resolve })
        }
      }
    }, writableStrategy, readableStrategy)
  }
}
