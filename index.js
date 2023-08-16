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
    /** @type {I[]} */
    const queue = []
    /** @param {TransformStreamDefaultController<O>} controller */
    const startTasks = controller => {
      while (pending < concurrency) {
        const input = queue.shift()
        if (input == null) break
        pending++
        transformer(input)
          .then(value => {
            controller.enqueue(value)
            pending--
            if (pending === 0 && onIdle) {
              return onIdle()
            }
            startTasks(controller)
          })
          .catch(error => controller.error(error))
      }
    }
    /** @type {() => void|undefined} */
    let onIdle
    super({
      transform (input, controller) {
        queue.push(input)
        startTasks(controller)
      },
      flush () {
        if (pending !== 0) {
          return new Promise(resolve => { onIdle = resolve })
        }
      }
    }, writableStrategy, readableStrategy)
  }
}