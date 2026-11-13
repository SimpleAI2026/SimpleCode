# Third-party licenses

SimpleCode vendors language runtimes into `wasm/` (not committed; see `./build.sh vendor`). The notices below cover those runtimes and the toolchains used to build Lua, Go, and Shell. License texts are the upstream notices; they are included so a deployment can ship them with the binaries.

## Application

- [Runno](https://github.com/taybenlor/runno) `@runno/wasi` — MIT. Provides the in-browser WASI preview1 host.
- UI dependencies (Vue, Monaco, xterm, Tailwind, shadcn-vue / reka-ui) — see each package's license in `node_modules`.
- [Sucrase](https://github.com/alangpierce/sucrase) — MIT. Loaded in the browser only when TypeScript is run, to strip types before QuickJS. It does not type-check.

## Runtimes copied from Runno `langs/`

| Runtime | License |
|---|---|
| CPython 3.11.3 (VMware WebAssembly Language Runtimes) | PSF License |
| Ruby 3.2.0 | Ruby License / BSD-2-Clause |
| PHP 8.2.0 cgi | PHP License 3.01 |
| wasmedge-quickjs | Apache-2.0 (QuickJS itself is MIT) |
| SQLite 3 | Public Domain |
| clang / wasm-ld (binji wasm-clang, LLVM 8) | Apache-2.0 with LLVM exceptions |

## Lua 5.4.9

Built from https://www.lua.org/ftp/lua-5.4.9.tar.gz with wasi-sdk 33. Lua is MIT:

```
Copyright (C) 1994-2026 Lua.org, PUC-Rio.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

wasi-sdk / LLVM is Apache-2.0 with LLVM exceptions. wasi-libc is a mix of MIT, BSD, and Apache-2.0 (see the wasi-sdk sysroot). The Wasm binary links `libc`, `libsetjmp`, `libwasi-emulated-signal`, and `libwasi-emulated-process-clocks` from that sysroot.

## Go (Yaegi 0.16.1 on Go 1.22.12)

- [Yaegi](https://github.com/traefik/yaegi) v0.16.1 — Apache-2.0. Copyright Traefik Labs and contributors.
- The wasm binary also contains the Go 1.22.12 runtime and standard library, which are BSD-3-Clause:

```
Copyright (c) 2009 The Go Authors. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of Google Inc. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

Source for the small WASI wrapper is `scripts/builders/go/main.go` in this repository.

## Shell (wasi-sh)

`wasi-sh.wasm` is compiled from `scripts/builders/shell/wasi-sh.c` in this repository with wasi-sdk 33. It is a small single-process shell (builtins and in-memory pipes only). It is not GNU bash and not BusyBox.

The shell source is MIT:

```
Copyright (c) 2026 SimpleCode contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

The binary links wasi-libc from wasi-sdk (MIT, BSD, and Apache-2.0; see the wasi-sdk sysroot). Public bash and BusyBox wasm builds were not vendored: they need host imports this runtime does not provide, and their licenses are GPL (see plan/LANGUAGES.md §9.1).

## Rust (weblings)

The unpacked files are committed at `wasm/rust/rustc.wasm` (87,871,387 bytes, sha256 `41412081eefc3e08ec5664ed0748902a7e575e1f267898dcc64d412702df7e83`) and `wasm/rust/sysroot-wasip1.bundle` (71,313,335 bytes, sha256 `6dba13d6077cb7936ed6661cd1087bc9e92dc1d8b35903ecf22881c97ac3980b`). They are not part of `wasm/manifest.json`. The page loads only these same-origin copies.

`./build.sh vendor --rust` checks the pinned `artifacts-test-7` archives and skips when those files already match. `./build.sh vendor --rust --refresh` downloads them again:

- `rustc.wasm` comes from [rustc-wasm.tar.zst](https://github.com/AngelOnFira/wasm-rustc/releases/download/artifacts-test-7/rustc-wasm.tar.zst) (sha256 `a96f6d53afff3c95d6387def27f6ddb53a02575679dc6c981d60797c32dcd022`). The same bytes were published at `https://weblings.forest-anderson.ca/rustc/rustc.wasm`.
- `sysroot-wasip1.bundle` comes from [wasip1-sysroot.tar.zst](https://github.com/AngelOnFira/wasm-rustc/releases/download/artifacts-test-7/wasip1-sysroot.tar.zst) (sha256 `4eedff7b0cd4330bfe226734b67751a97fac5572ac55392e93f9d3e4886a277d`). The same bytes were published at `https://weblings.forest-anderson.ca/rustc/sysroot-wasip1.bundle`.

Digests are also in `scripts/sources.lock.json` and `wasm/rust/SOURCES.md`. The demo host is not a runtime download.

- [weblings](https://github.com/AngelOnFira/weblings) — MIT. The compiler worker in `src/rustc/worker.js` follows its `app/public/worker.js`.
- rustc and Cranelift (`rustc_codegen_cranelift`) — MIT OR Apache-2.0. The wasm binary is the pinned artifact above.
- [browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim) — Apache-2.0 OR MIT. The copies under `src/rustc/shim/` come from the weblings `app/public/vendor/browser_wasi_shim` tree and are used only to host rustc, not the user's program.
- [fzstd](https://github.com/101arrowz/fzstd) — MIT. Used by `scripts/vendor-rust.mjs` to decompress the archives. It is not loaded in the browser.

## DeepLearning (Pyodide, NumPy, Fashion-MNIST)

- [Pyodide](https://pyodide.org/) 314.0.7 — Mozilla Public License 2.0. CPython 3.14.2 and the Pyodide runtime (`pyodide.asm.wasm`, `pyodide.asm.mjs`, `pyodide.mjs`, `python_stdlib.zip`). Vendored under `wasm/pyodide/` by `./build.sh vendor --pyodide`. The page loads those same-origin files only. The upstream `pyodide.mjs` default `packageBaseUrl` points at jsDelivr; the vendored copy removes that default.
- [NumPy](https://numpy.org/) 2.4.6 — BSD-3-Clause. Wheel `numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl`, loaded with `loadPackage("numpy")` from the same directory.
- [Fashion-MNIST](https://github.com/zalandoresearch/fashion-mnist) — MIT, Copyright (c) 2017 Zalando SE. `wasm/pyodide/fashion-mnist.bin` is the first 5,000 training images and the first 1,000 test images (28×28 uint8) plus labels. Attribution is also written to `/data/FASHION.txt` in the Pyodide filesystem.
- `src/pyodide/minitorch.py` is original teaching code in this repository (MIT). It is not an upstream package.

## Java (TeaVM)

Not part of the default `./build.sh vendor`. `./build.sh vendor --java` downloads four files from `https://teavm.org/playground/3/` into `wasm/java/`. Digests are in `scripts/sources.lock.json`. The page loads those same-origin copies only. `teavm.org` does not send CORS headers, so a COEP page cannot fetch the upstream URLs.

- [TeaVM](https://github.com/konsoletyper/teavm) 0.16.0 — Apache-2.0. Copyright Alexey Andreev and contributors. `compiler.wasm-runtime.js` is the playground runtime and carries that Apache-2.0 header.
- [teavm-javac](https://github.com/konsoletyper/teavm-javac) — the README states Apache-2.0. The GitHub license field for that repository is empty.
- `compiler.wasm` contains OpenJDK `javac`. That compiler is GPL-2.0 with the Classpath Exception.
- The TeaVM class library includes portions of Apache Harmony (Apache-2.0), Joda-Time (Apache-2.0), and jzlib (BSD-style).
- `src/teavm/bridge/` is source written for this repository: a replacement `TConsoleInputStream`, a small `TScanner`, and a `TInputStreamReader` that does not touch `java.nio`. The `Scanner` stub appended to the SDK archive in memory is the same small class, compiled with `--patch-module java.base`. `org.teavm.interop.Import` is used only when rebuilding that bridge with a host `javac`. It is not a separate download.

## LeetCode statements and solutions

Problem statements in `docs/leetcode/` are original writing. Facts (number, public title, difficulty, examples, and limits) were read from [halfrost/LeetCode-Go](https://github.com/halfrost/LeetCode-Go) at `1dde49c8ab37a08f21a4fb249d7bd90af4a9c58e`. That repository is MIT, Copyright (c) 2017 halfrost. The checkout is gitignored under `thirdparty/LeetCode-Go/` and is not read at runtime. Upstream sentences are not stored. See `docs/leetcode/leetcode-go.lock.json`.

Solution source files are copied from four repositories pinned in `docs/leetcode/sources.lock.json` (retrieved 2026-10-18). Each file records the upstream URL, commit, and modifications. The same-origin license texts are `docs/leetcode/LICENSES/MIT.txt` and `docs/leetcode/LICENSES/CC-BY-SA-4.0.txt`.

| Repository | Commit | License |
|---|---|---|
| [neetcode-gh/leetcode](https://github.com/neetcode-gh/leetcode) | `d5ebb3ea8bd4b52d605bc7aa179e22af684d31bb` | MIT. Copyright (c) 2022 neetcode-gh |
| [kamyu104/LeetCode-Solutions](https://github.com/kamyu104/LeetCode-Solutions) | `8e29ccd49e73439f0dc36b6bdd0f3bded259c7b3` | MIT. Copyright (c) 2018 https://github.com/kamyu104/LeetCode-Solutions |
| [tiationg-kho/leetcode-pattern-500](https://github.com/tiationg-kho/leetcode-pattern-500) | `c3ee9ee6e40d386600e0a3545844350a264c5b56` | MIT. Copyright (c) 2023 Tiationg Kho |
| [doocs/leetcode](https://github.com/doocs/leetcode) | `88c8c2c29f19c186d7cc05c9db17245d9ae3df43` | CC BY-SA 4.0. Copyright Doocs contributors |

Adaptations of a doocs file stay under CC BY-SA 4.0. That share-alike duty covers the adapted solution file only. It does not cover the Vue UI, the language runtimes, or the thirteen Quick Start books.

本项目著作权归 GitHub 开源社区 Doocs 所有，商业转载请联系 @yanglbme 获得授权，非商业转载请注明出处。

List-only sources, with no solution text copied: [kernelvale/leetcode-hot100](https://github.com/kernelvale/leetcode-hot100) (`e55875275c6ce2d55141196cb1a025a112f43684`, ids used to cross-check Top 100 Liked), [afatcoder/LeetcodeTop](https://github.com/afatcoder/LeetcodeTop) (`7105c17a4d3f61baa242f8a36a7056b5bbd0baf0`, ids only; the repository has no SPDX license), and [hoangcaobao/LeetCode](https://github.com/hoangcaobao/LeetCode) (`64660b9f3a001aa840ec173ceb0b90dfd2f93b41`, MIT, ids and difficulty column only).

## Linux guest (v86 + Buildroot image)

The sidebar language Linux is not a WASI module. `./build.sh vendor` downloads pinned files and writes `wasm/linux-state.zst`, a zstd frame of the v86 snapshot. The browser stores that frame in the Cache API and hands it to v86, which decompresses it with the zstd already linked into `v86.wasm`. The `zstd` CLI used at vendor time is build-only (BSD-3-Clause or GPL-2.0, https://github.com/facebook/zstd); it is not shipped to the page.

- [v86](https://github.com/copy/v86) 0.5.471 (`libv86.mjs`, `v86.wasm`) — BSD-2-Clause. Copyright (c) 2012, The v86 contributors. The full notice is `LICENSES/v86-BSD-2-Clause.txt`. The npm package also bundles Berkeley SoftFloat and other pieces listed in the upstream README; those stay inside the vendored `libv86` build.
- SeaBIOS and the VGA BIOS (`seabios.bin`, `vgabios.bin`) come from the v86 `bios/` directory. SeaBIOS is LGPL-2.1 (`COPYING.LESSER` in the SeaBIOS sources). The files are pinned by sha256 because the npm tarball does not include them.
- Guest kernel: Linux **6.8.12** i686, GPL-2.0. The bzImage is the unmodified v86 demo file `https://i.copy.sh/buildroot-bzimage68.bin` (profile “Buildroot Linux 6.8”), not a Buildroot 2026.08 tree built in this repository.
- Guest userspace: Buildroot **2024.05.2** (`/etc/os-release`) and BusyBox **1.36.1** (GPL-2.0). BusyBox source for that version: https://busybox.net/downloads/busybox-1.36.1.tar.bz2 . Buildroot 2024.05.2: https://buildroot.org/downloads/buildroot-2024.05.2.tar.gz . The image is prebuilt; `scripts/builders/linux/rebuild.sh` documents a Linux or Docker fetch of Buildroot 2026.08 and is not what `./build.sh vendor` runs. A from-scratch image would not match the pinned digest.
- 9p on this image is mounted at `/mnt` (tag `host9p`), not `/mnt/host`.
