import { Parallel } from './index.js'
import defer from 'p-defer'

export const test = {
  'should transform in parallel': async (/** @type {import('entail').assert} */ assert) => {
    const { promise, resolve } = defer()
    // first function depends on the second function being called
    // the stream cannot complete unless these are called in parallel
    const input = [() => promise, async () => resolve()]
    /** @type {Parallel<() => Promise<any>>} */
    const parallel = new Parallel(2, fn => fn())
    await collect(toReadable(input).pipeThrough(parallel))
    assert.ok(true)
  },

  'should transform all values': async (/** @type {import('entail').assert} */ assert) => {
    const input = [0, 1, 2, 3, 4, 5]
    const parallel = new Parallel(2, async input => {
      return new Promise(resolve => setTimeout(() => resolve(input), input))
    })
    const output = await collect(toReadable(input).pipeThrough(parallel))
    assert.deepEqual(output.sort(), input)
  },

  'should exert backpressure when max concurrency reached': async (/** @type {import('entail').assert} */ assert) => {
    const concurrency = 2
    const input = [0, 1, 2, 3, 4, 5]
    let running = 0
    let maxRunning = 0

    const parallel = new Parallel(concurrency, async input => {
      return new Promise(resolve => setTimeout(() => resolve(input), input * 100))
    })

    const readable = new ReadableStream({
      pull (controller) {
        const value = input.shift()
        if (value == null) return controller.close()
        running++
        maxRunning = Math.max(running, maxRunning)
        controller.enqueue(value)
      }
    // disable internal buffer so the readable doesn't pull, increment the
    // count and just add the chunk to the buffer i.e. each pull is a pull from
    // the Parallel stream.
    }, new CountQueuingStrategy({ highWaterMark: 0 }))

    await readable
      .pipeThrough(parallel)
      .pipeTo(new WritableStream({ write: () => { running-- } }))

    assert.equal(maxRunning, concurrency)
  }
}

/**
 * @template T
 * @param {T[]} input
 */
const toReadable = input => {
  const values = [...input]
  /** @type {ReadableStream<T>} */
  const stream = new ReadableStream({
    pull (controller) {
      const value = values.shift()
      if (value == null) return controller.close()
      controller.enqueue(value)
    }
  })
  return stream
}

/**
 * @template T
 * @param {ReadableStream<T>} readable
 */
const collect = async readable => {
  /** @type {T[]} */
  const chunks = []
  await readable.pipeTo(new WritableStream({ write: chunk => { chunks.push(chunk) } }))
  return chunks
}
