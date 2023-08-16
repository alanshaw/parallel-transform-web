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

const concurrency = 10

await new ReadableStream({ pull: controller => controller.enqueue(Math.random()) })
  .pipeThrough(new Parallel(concurrency, n => new Promise(resolve => setTimeout(() => resolve(n), n))))
  .pipeTo(new WritableStream({ write: n => console.log('Delayed by', n) }))
```


## Contributing

Feel free to join in. All welcome. Please [open an issue](https://github.com/alanshaw/parallel-transform-web/issues)!

## License

Dual-licensed under [MIT + Apache 2.0](https://github.com/alanshaw/parallel-transform-web/blob/main/LICENSE.md)
