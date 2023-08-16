# parallel-transform-web

[![Build](https://github.com/alanshaw/parallel-transform-web/actions/workflows/build.yml/badge.svg)](https://github.com/alanshaw/parallel-transform-web/actions/workflows/build.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Parallel transform for web streams. Zero dependencies.

Note: does _not_ preserve ordering.

## Install

```sh
npm i parallel-transform-web
```

## Usage

```js
import { Parallel } from 'parallel-transform-web'

// a stream that yields random numbers, forever!
const randomNumbers = new ReadableStream({ pull: controller => controller.enqueue(Math.random() * 10) })
// run up to 10 transforms concurrently
const concurrency = 10
// identity transform that adds a short delay
const transformer = n => new Promise(resolve => setTimeout(() => resolve(n), n))
// parallelized transform stream
const delayer = new Parallel(concurrency, transformer)
// writable stream that just logs whatever is written to it
const logger = new WritableStream({ write: n => console.log(n) })

await randomNumbers.pipeThrough(delayer).pipeTo(logger)
```


## Contributing

Feel free to join in. All welcome. Please [open an issue](https://github.com/alanshaw/parallel-transform-web/issues)!

## License

Dual-licensed under [MIT + Apache 2.0](https://github.com/alanshaw/parallel-transform-web/blob/main/LICENSE.md)
