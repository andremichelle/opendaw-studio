# Tech-Stack

## Toolchain

* [Vite](https://vite.dev)
* [Typescript](https://www.typescriptlang.org)
* [Sass](https://sass-lang.com)

## Libraries

openDAW uses minimal external dependencies, avoiding hidden behaviors from bulky UI frameworks.

Each in-house library has a clear, focused purpose. [github repository](https://github.com/andremichelle/opendaw-lib)

### Dependency Table

| Library       | Dependencies                        |
|---------------|-------------------------------------|
| **std**       | none                                |
| **dsp**       | std                                 |
| **dom**       | std                                 |
| **jsx**       | std, dom                            |
| **runtime**   | std                                 |
| **box**       | std, dom, runtime                   |
| **box-forge** | std, dom, box                       |
| **fusion**    | std, dom, box, runtime (all peered) |

### In-House Runtime

* std (Core)
* dsp (DSP & Sequencing)
* dom (DOM Integration)
* jsx ([JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)) Integration)
* runtime (Runtime and Scheduling)

### In-House Data Management

* box (Runtime Immutable Data Graph)
* box-forge (Box Code Generator)

### External

* [jszip](https://www.npmjs.com/package/jszip) (Pack & Unpack Zip-Files)
* [markdown-it](https://www.npmjs.com/package/markdown-it) (Markdown parser)