# SimpleCode 贡献者指南

给后续改这个仓库的人和代理用。先写 `plan/*.md`，再改代码。合进 `main` 走 Pull Request，合并前 `./build.sh build` 和 `./build.sh test` 要通过。

## 项目是什么

浏览器里的多语言练习场：左边选语言，中间 Monaco 编辑，下面 xterm 看输出，工具栏 Run 在本机执行。Python、Ruby、JS/TS、SQLite、C、C++、PHP、Lua、Go、Shell 的运行时是 WASI preview1 命令模块，由 `@runno/wasi` 的 `WASIWorkerHost` 在 Web Worker 里跑。标准输入走 `SharedArrayBuffer`，所以页面必须跨源隔离。Rust 的编译器是 weblings 的 Cranelift rustc，在另一个 Worker 里编译；编出来的 wasm 再交给同一个 `WASIWorkerHost`。Java 的编译和运行都在 TeaVM 自己的 Worker 里（Wasm GC），产物不交给 `WASIWorkerHost`。Linux 是 v86 客户机，跑在主线程，串口接到同一份 xterm。

教学抽屉叫「{语言} 快速入门」。Markdown 在构建时预渲染。十五本书都已按菜鸟教程的短节写成，内部 id 不变。Linux 的书在 `docs/linux/`，Rust 的书在 `docs/rust/`，Java 的书在 `docs/java/`。NumPy 在 `docs/numpy/`，深度学习在 `docs/dl/chapter_*/`（顺序见 `scripts/docs/dl-toc.ts`，阶段 2 先落地前言、安装、记号、引言），两本都由侧栏 DeepLearning 打开（运行时 id `numpy`，Pyodide）。细节见 `plan/LANGUAGES.md` §10、§11 和 §12，`plan/DEEP_LEARNING.md`，以及 `plan/LEARN.md` §20 和 §23。

## 架构

```
侧栏 LanguageSidebar
  → stores/language.ts 选中语言，按需下载 wasm/
编辑器 CodeEditor（Monaco）
  → stores/editor.ts 草稿在 localStorage
工具栏 RunButton
  → stores/run.ts
  → src/core/runner.ts  RunSession
       ├─ WASIWorkerHost（WASI 语言，Web Worker；Rust 的产物也走这里）
       ├─ weblings rustc（rust，单独 Worker，只编译）
       ├─ TeaVM javac（java，单独 Worker，编译并运行）
       └─ LinuxMachine（linux，主线程 v86，src/core/linux.ts）
终端 src/core/terminal.ts（xterm；Linux 期间按键原样送进串口）
文档 DocsDrawer
  → scripts/docs/render.ts 预渲染 docs/
  → useRunFromDoc 把示例装进编辑器再 Run
工具栏「快速入门 | LeetCode」共用这扇抽屉（`data-mode`）。模式在 `stores/study.ts`。
题库在 `docs/leetcode/`，英文题名和摘要在 `docs/en/leetcode/`，不算一本快速入门。
```

资源在 `wasm/`。`scripts/languages.config.mjs` 列出资产和语言。`scripts/write-manifest.mjs` 按磁盘文件生成 `wasm/manifest.json`（`size`、`sha256`）。该文件 gitignore，不提交。`src/core/wasmLoader.ts` 用 Cache API（`simplecode-wasm-v1`）缓存，并用清单里的 `size` 核对。

语言 id：`python`、`ruby`、`quickjs`（界面文案 JS/TS）、`sqlite`、`clang`、`clangpp`、`php-cgi`、`lua`、`go`、`shell`、`rust`、`java`、`linux`（界面文案 Linux，短标签 `Lx`；Java 短标签 `Jv`）。Rust 的 `rustc.wasm` 和 `sysroot-wasip1.bundle` 提交在 `wasm/rust/`，不写进 `wasm/manifest.json`。页面只从同源读这两份，Cache API 名是 `simplecode-rustc-v1`。`./build.sh vendor --rust` 在文件与 pin 一致时跳过；`--refresh` 再从 GitHub Release 的 zstd 校验并覆盖。GitHub Release 资产在 COEP 页面里没有 CORS，不能当浏览器下载地址。Java 同样不进默认 vendor 和清单。`./build.sh vendor --java` 校验 pin 后把四份 TeaVM 文件放到 `wasm/java/`。页面只读这四份同源文件，Cache API 名是 `simplecode-teavm-v1`。`teavm.org` 没有 CORS，不能当浏览器下载地址。同源钉住的文件请求带 `?v=`（sha256 前 12 位），先 `cache: "no-cache"`，不对再 `cache: "reload"` 一次。空正文或短正文也走这次重试。dev 和 preview 里缺失的 `/wasm/**` 是 404，不是首页；存在的文件响应是 `Cache-Control: no-cache`。

## 技术栈和命令

Vue 3、Vite、TypeScript、shadcn-vue、Monaco、xterm、`@runno/wasi`。包管理用 **yarn**。

`./build.sh`：

| 子命令 | 作用 |
|---|---|
| `install` | `yarn install` |
| `vendor` | 从 `thirdparty/runno/langs` 拷贝运行时，编译 Lua / Go / Shell，并下载 Linux 客户机、生成快照。结束时重写清单。任何一步失败就校验并解开 `vendor/prebuilt/` 里提交的 tar.gz（超过 90 MB 会拆成 part），再按解出来的文件重写清单。`--pack` 用当前 `wasm/` 重打这些包。`--rust` 另下 weblings 工具链（已提交在 `wasm/rust/`，不进这些包）。`--java` 另下 TeaVM 四份文件；下载失败则解开包里的 java 那一份。两者都不进这份清单 |
| `dev` | Vite 开发服务器，带 COOP/COEP，默认端口 5173 |
| `build` | `yarn vue-tsc --noEmit`，再 `yarn vite build` 到 `dist/`（含 `dist/wasm`） |
| `preview` | 用 COOP/COEP 提供 `dist/` |
| `test` | 文档单元测试、`tests/i18n-unit.test.ts`、`tests/leetcode-unit.test.ts`、`tests/terminal-log.test.ts`、`check-mono`、hello-world 冒烟、`docs-smoke`、`tests/leetcode-smoke.mjs`、`tests/learn.spec.mjs`、`tests/ui-chrome.spec.mjs`、`tests/terminal-switch.spec.mjs` |
| `clean` | 删 `dist/`。`--all` 再删 `node_modules/` 和 `wasm/` |

缺 wasm 时，`dev` / `build` 会先尝试只重写清单；清单对不上文件才会 vendor。vendor 失败则用 `vendor/prebuilt/`。`build` 还会在 `wasm/java/` 缺文件时走 `vendor --java`（同样可以退回预构建包）。Vercel 的 `yarn build` 就是 `bash ./build.sh build`。

## 界面规矩

黑白单色。侧栏、工具栏、按钮、抽屉、终端只用中性灰。**Monaco 语法色是唯一例外。** 文档 UI 由 `scripts/check-mono.mjs` 卡住彩色 Tailwind 类和非灰阶色值。

- 折叠侧栏只有图标（约 56px）。缓存用量、清除、主题、展开都在**底部**。展开时一行一种语言。
- 展开时，SimpleCode 标题右侧是 `?` 和「中 / EN」胶囊。`?` 打开关于弹层。折叠后这两项在页脚，56px 的标题行放不下胶囊。
- 界面文案走 `src/i18n`（`zh` / `en`，默认 `zh`，`localStorage` 键 `simplecode:locale`）。中文书在 `docs/<book>/`，英文书在 `docs/en/<book>/`（同一文件名）。界面是 EN 时抽屉打开英文；缺的那一本或那一章仍显示 “English Quick Start is under construction”，点 “View the Chinese version” 看中文。
- 侧栏 wasm 进度条贴在语言按钮的底边，`inset-x-0 bottom-0 h-0.5`，左右与按钮同宽，不要 `my-[8px]`。
- Run 只用 `src/components/RunButton.vue`：`Button` 的 `size="xs"`（高 28px），图标 Play，文案 `Run`。工具栏和文档代码块共用它。
- 文档抽屉的 `top` 是 `var(--editor-toolbar-h)`（`src/style.css` 里 2.5rem）。抽屉不得盖住 Run 和语言切换。
- 等宽字体是 JetBrains Mono，中文回退 `SimpleCode CJK`（`size-adjust: 120%`）。xterm 里一个汉字占两格；系统黑体的 1em 字面宽会在格子之间留出空隙，所以才放大到 120%。字体用 `local()`，不从网络拉，否则 COEP 会挡住。

## 加一门语言

1. 在 `plan/LANGUAGES.md` 写清运行时、许可证、体积、做不到的事。
2. `scripts/languages.config.mjs` 增加资产和语言（`id`、`label`、`short`、`syntax`、`fileName`、`run`）。
3. 版本和 sha256 写进 `scripts/sources.lock.json`。构建脚本放在 `scripts/builders/<name>/`，bash 3.2，macOS 与 Linux、x86_64 与 arm64 都能走（`uname` 选工具链，或 `prebuiltUrl` 退回已发布文件）。
4. `./build.sh vendor` 产出 wasm。清单由 `write-manifest.mjs` 从磁盘生成，**不要提交** `wasm/manifest.json`。换了运行时字节之后再跑 `./build.sh vendor --java`（若 Java 也变了）和 `./build.sh vendor --pack`，把 `vendor/prebuilt/` 一起提交。Rust 仍只提交 `wasm/rust/`，不打进这个包。
5. 许可证写入 `LICENSES/THIRD_PARTY.md`。
6. `tests/smoke.mjs` 加一条 hello-world。有书之后再加文档冒烟。

WASI 命令模块必须导出 `_start`，导入只有 `wasi_snapshot_preview1`。带 `nimbus_proc`、`env` 或 Emscripten 胶水的二进制不能交给 `WASIWorkerHost`。

## 快速入门怎么写

标准在 `plan/LEARN.md` §19。对照是菜鸟教程的**目录形状**（正式章名、一节一件事）。句子和示例字符串自己写，不抄原文。

- 第 0 章文件名是 `index.md`。其余章节不要用 `index` 当 slug，否则会盖住概览。
- 每章至少三个 `###`。中文章前引言不超过 180 个汉字，每节去掉代码后 1 到 400 个汉字。英文在 `docs/en/<book>/`，引言不超过 140 个词，每节 1 到 280 个词。详见 `plan/LEARN.md` §21。
- 每章至少两个可运行块：info 里有 `run`，并有 `expect="子串"`。
- `norun` 只供阅读，旁边写原因。`smoke=skip` 仍算结构测试里的可运行块，`docs-smoke` 不执行它（Python 的 `while True` 用了这个）。
- 不要再写固定的「常见错误 / 最佳实践 / 小结 / 练习」四节。
- 十五本书一起检查连续 60 个汉字不重复。NumPy 和深度学习不套用「至少 20 章」那一档，但仍走同一套节长、可运行块和跨书去重。
- 围栏属性见 `src/docs/fence.ts`：`run`、`norun`、`stdin`、`expect`、`title`、`smoke`、`exit`。`stdin=""` 表示立刻 EOF。

现在的书（章数，中英各一套）：Python 40、JavaScript 42、Ruby 31、SQL 35、C 35、C++ 51、PHP 42、Lua 30、Go 37、Shell 29、Linux 38、Rust 38、Java 40、NumPy 17、深度学习 4。中英各 509 章。`./build.sh build` 打出 `docs: 1018 chapters, 3134 runnable blocks`（中英各 1567 个可运行块）。其中一个 Python `while True` 是 `smoke=skip`。英文在 `docs/en/<book>/`。`SHIPPED_BOOKS` 在 `src/docs/runtime.ts`。NumPy 和深度学习的围栏语言是 `numpy`，`docs-smoke` 默认会跑，走 Pyodide 而不是 WASI CPython。Rust 的 `docs-smoke` 默认不跑（工具链约 152 MB）。`SIMPLECODE_RUST_DOCS=1` 才执行书里的块，中英都会跑。Java 的 `docs-smoke` 同样默认不跑（每块都要在浏览器里编 wasm）。`SIMPLECODE_JAVA_DOCS=1` 才执行。默认文档冒烟不含 Rust 和 Java，也不跑 Python 那个 `smoke=skip`。`tests/smoke.mjs` 仍会编一条 Rust hello、一条编译错误，并试标准输入和写文件；Java 同样有 hello、标准输入、编译错误和 `Thread.sleep`。Linux 的文档冒烟会启动客户机，英文块复用同一份快照。

### 运行时限制（可运行块里避开）

- **C++**：clang 8，大约 gnu++14。`std::sort` 链接缺少 `__lttf2`。`throw`、线程、`<filesystem>` 不放进可运行块。未使用变量会在 `-Werror` 下失败。
- **C**：同样 `-Werror`。`fopen` 标只读。
- **PHP**：8.2，`php -q`，文件以 `<?php` 开头。`STDIN` 未定义，`php://stdin` 和 `php://input` 读不到 WASI 标准输入。没有 curl、mysqli、可靠的超全局。`echo` 用逗号分隔**不会**自动加空格。
- **Shell（wasi-sh）**：只有内建 `echo`、`printf`、`read`、`cat`、`true` / `false` / `:`、`exit`、`test` / `[ ]`，赋值、`$VAR`、`if` / `while` / `for`、内建之间的管道和重定向。没有 `cd`、`$(…)`、`$((…))`、函数、`source`、通配、here-doc、后台和外部命令（退出 127）。`$$` 固定打印 `1`。赋值里不能加引号：`item=key` 可以，`item="key"` 会被当成命令。
- **Go（Yaegi 0.16.1）**：没有网络，不能 import 第三方。`time.Sleep` 在 `poll_oneoff` 上等不回来。自定义 `error` 放进接口再调用 `Error()` 会 panic。
- **Lua 5.4.9**：`pcall` 依赖 wasi-sdk 的 `-mllvm -wasm-enable-sjlj` 和 `-lsetjmp`。不要定义 `LUA_USE_POSIX`，否则 `pcall` 坏掉。`#` 和 `string.len` 按字节。`print` 多个参数之间是制表符。没有 `os.execute`、`io.popen`，也不能 `require` 别的文件。
- **Rust（weblings，`artifacts-test-7`）**：单个 `main.rs`，edition 2024，`-O`，`panic=abort`。没有 Cargo、crates.io、过程宏、`std::thread` 和 `std::thread::sleep`（宿主的 `poll_oneoff` 时钟会空转）。编译器本身要虚拟 sysroot 和 `CLIF2WASM_OBJECT=1`，所以不作为 preview1 命令注册。产物只导入 `wasi_snapshot_preview1` 并导出 `_start`。Safari 没有测过。细节在 `plan/LANGUAGES.md` §11.10。
- **Java（TeaVM 0.16.0 playground `/3/`）**：单个 `Main.java`，`public` 类必须叫 `Main`。不是 OpenJDK。没有包、正则、nio、反射、JNI 和真实文件。`Scanner` 与 `InputStreamReader` 是仓库里的替换类，不是 JDK 原件。`Thread.sleep` 靠 Worker 里的 `setTimeout`，Worker 要留到计时器走完。标准输入是 `simplecode.read`，在 Worker 里 `Atomics.wait`，不要改成 WASI `fd_read`。没有 Wasm GC 就停，不要改用 CheerpJ。细节在 `plan/LANGUAGES.md` §12 和 `plan/LEARN.md` §23。
- **Linux（v86 0.5.471）**：客户机是 i686、内核 6.8.12、Buildroot 2024.05.2、BusyBox 1.36.1，家目录 `/root`，提示符 `~% `。没有网络、包管理器、ssh、vim。`apt`、`yum`、`ssh`、`vim`、`passwd`、`fdisk`、`reboot`、`useradd` 标 `norun`。每次 Run 从快照恢复，围栏之间不共享 `/tmp`。`ls` 要加 `--color=never`。`chmod u+x` 在 644 文件上是 `-rwxr--r--`。9p 在 `/mnt`，脚本是 `/mnt/main.sh`。退出码来自串口上最后一次 `__SC_EXIT:` 后的数字。

## 工作顺序

1. 多步改动先写进 `plan/DESIGN.md`、`plan/LANGUAGES.md`、`plan/LEARN.md` 或 `plan/LEETCODE.md`。
2. 从最新的 `origin/main` 拉分支，提交，推上去，开 PR。
3. 合并前跑 `./build.sh build` 和 `./build.sh test`。草稿 PR 不能合并，准备好就标成可评审。
4. 一次 PR 里不要混无关的重构。文档书按语言分提交，方便看 diff。

## 已经踩过的坑

**`wasm/manifest.json` 体积对不上。** 以前把清单提交进 git。Apple Silicon 上的 Lua 是 720592 字节，Linux 锁定的是 720144，下载检查报大小不匹配；换机器 `git pull` 又会把别人的清单冲突回来。处理：清单不入库，`write-manifest.mjs` 用磁盘文件重写 `size` 和 `sha256`。不要 `git checkout -- wasm/manifest.json`。这份脚本开头也不能留 shebang，否则 Vite 把它当模块导入时会失败（`d668917`）。

**构建脚本只能在 Linux x86_64 上跑。** Lua / Go 的工具链要按 `uname` 选 linux/darwin 与 x86_64/arm64 的压缩包，并在 lock 里钉 sha256。macOS 自带 bash 3.2，脚本不能用 bash 4 语法。Lua 编译前清掉 `SDKROOT`，避免 Xcode 把 WASI sysroot 指走。Go 用下载的工具链（`GOTOOLCHAIN=local`）。编不出来时下载 `prebuiltUrl`，摘要必须和 lock 一致。

**Apple Silicon 的 Lua 摘要不同。** `libclang_rt.builtins.a` 和 Linux 不是同一份，产物 sha256 会变。lock 里用 `outputSha256ByHost`；没有钉的宿主保留二进制并打印摘要，不把 vendor 打失败。`SIMPLECODE_STRICT_WASM_DIGEST=1` 才把这个警告变成错误。清单跟磁盘走之后，缓存检查不再拿 Linux 的字节数去卡 Mac。

**Shiki 多出空行。** 高亮结果在 `.line` 之间插入换行，外层 `white-space: pre` 把这些换行画成额外的空行。`collapseShikiLines` 去掉 `.line` 之间的换行，`.doc-code pre` 用 `white-space: normal`。真正的空行仍是一个空的 `.line`。

**抽屉盖住工具栏。** 抽屉曾经从视口顶边开始，Run 点不到。`DocsDrawer` 的 `top` 改为 `--editor-toolbar-h`，和工具栏同一条偏移。

**草稿 PR 合并不了。** GitHub 上 draft 不能进 `main`。要合并时先标成 Ready for review。

**COOP/COEP 和 SharedArrayBuffer。** `WASIWorkerHost` 一构造就分配 SAB。页面没有 `Cross-Origin-Opener-Policy: same-origin` 和 `Cross-Origin-Embedder-Policy: require-corp` 时，构造直接抛错，`IsolationGuard` 会挡住。Vite 的 `server.headers` 和 `preview.headers` 要带这两项。跨源字体和 CDN 脚本在 COEP 下会被拒绝，所以字体和 wasm 都同源。

没有这些头的静态站（`python -m http.server`、GitHub Pages）由 `public/coi-serviceworker.js` 补头。`src/coi.ts` 在挂载前注册，地址相对 `import.meta.env.BASE_URL`。已经隔离就不注册。需要时只刷新一次，用 `sessionStorage` 键 `simplecode:coi-reload` 防循环。COEP 用 `require-corp`，不用 `credentialless`：和开发服务器一致，而且资源都同源。Service Worker 只转发正文，Wasm / Linux / 同源 Rust 下载的字节数不能变。`file://` 和隐私模式仍走说明页。说明页要写明 `http://localhost` 或 https 上的普通静态服务器可以打开。细节在 `plan/LEARN.md` §23。

**公开的 bash / BusyBox wasm 跑不起来。** `WASIWorkerHost` 只实现 `wasi_snapshot_preview1`。mayflower/busybox-wasm 带 JS 胶水；`@nimbus-sh/runtime-bash` 还要 `nimbus_proc`（`fork`、`execve`）和 `env`。所以 Shell 是仓库里的 `scripts/builders/shell/wasi-sh.c`。要真的 `ls` 和 `cd`，用侧栏 Linux（v86），不要再换一份 BusyBox wasm 塞进现有宿主。细节在 `plan/LANGUAGES.md` §9.1 和 §10。

**Linux 客户机。** 内存必须是 64 MiB。32 MiB 时内核解压停在大约 30 MB，串口不再出字。`uart1` 要打开，否则 `serial0-output-byte` 没有字节。虚拟机留在主线程：libv86 0.5.471 在浏览器里自己开 yield Worker，专用 Worker 没有 `window`。Node 里不要给 `navigator` 赋值（它是只读 getter），也不要把 `window` 设成 `globalThis`（会走到 Web Audio）。

**串口和退出码。** 写串口用 `serial_send_bytes` 加 `TextEncoder`。`serial0_send` 按 `charCodeAt` 截断，汉字会坏。读出用逐字节 `TextDecoder`（`stream: true`）。回车要映射成换行，xterm 的 Enter 客户机才认。包装命令是 `stty -echo; sh /mnt/main.sh < /mnt/stdin.txt; echo __SC_EXIT:$?; stty echo`。只认最后一次 `__SC_EXIT:(\d+)`；命令回显里就有 `__SC_EXIT:$?`，搜子串会提前结束。哨兵到达后先留着虚拟机，`stty echo` 还要跑，交互 shell 才有回显。Stop 才 `destroy`。Ctrl+C 送 `\x03`。

**9p 在 `/mnt`。** 这份镜像的 fstab 把 `host9p` 挂在 `/mnt`，不是 `/mnt/host`。`create_file("main.sh")` 出现在 `/mnt/main.sh`。教学文件放 `/tmp`，避免和脚本撞名。

**快照不钉字节，下载的是 zstd 帧。** `save_state()` 的原始缓冲大约 45.5 MB，不进 `wasm/`。vendor 用 zstd 19 写成 `linux-state.zst`（这次 18,285,816 字节）。v86 看帧头 `28 b5 2f fd` 自己解压，不看文件名；Cache API 存的是压缩字节，清单 `size` 对的是这份 `.zst`。不要把 `.zst` 标成 `Content-Encoding`，否则 `fetch` 会先解开，大小检查对不上。同一份输入再次 `save_state` 字节会变，所以 lock 里没有它的 sha256。`thirdparty/cache/linux/state.stamp` 是五个输入摘要再加压缩级别；stamp 不变且 `.zst` 非空，vendor 就跳过。状态文件不入库。每次 Run 把同一份压缩缓冲交给 `initial_state`。PATH 上没有 `zstd` 时，builder 用 `cc` 和 `make` 编译钉死的 zstd 1.5.7。bzImage 已经是压缩内核，再 gzip 只少大约 15 KB，不压。32 MiB 和不是 2 的幂的内存起不来。`drop_caches` 减不了这份 ramfs。

**镜像是钉死的上游 bzImage。** sha256 `507a759c70ab7a490a233be454d0b5b88bc667956a410b531cb4edc091e2eb1c`，Buildroot 2024.05.2 / BusyBox 1.36.1 / Linux 6.8.12。macOS 编不了 Buildroot。`./build.sh vendor` 下载这份文件。`scripts/builders/linux/rebuild.sh --fetch` 只核对 Buildroot 2026.08 源码包，不参与 vendor；从零编出来的树对不上这个摘要。BIOS 的 URL 指向 GitHub `master`，锁是 sha256，master 一变校验就失败。

**Linux 下载之后还有启动。** 六份文件合计 30,888,868 字节（快照压缩之后）。侧栏在下载阶段显示百分比，`detail === "boot"` 时显示「启动中」。换走语言要关掉虚拟机并把状态设回已缓存，下次再选才重新启动。启动过程中的 `LinuxKilled` 不是下载失败。

**SQL 概览被章名盖住。** 生成器用 slug `index` 写文件时，非第 0 章也会写成 `index.md`。只有 `chapter == 0` 才能用这个文件名（`ca3ab0b`）。

**README 配图不要放进 `docs/`。** `renderDocs` 把 `docs/` 下每个目录当成一本书，未知目录会让 Vite 构建失败（Vercel 的 `yarn build` 停在 `[simplecode-docs]`）。配图在 `assets/screenshots/`，文件名保持 `editor-run.png` 这一组。`public/` 会被拷进 `dist`，配图也不放那里。`tests/readme-assets.test.ts` 检查 README 和 `docs/GITHUB_META.md` 里的图片路径存在，并且顶层目录不是 `docs` 或 `public`。

**文档冒烟在章节壳出现时就去点代码块。** `docs-chapter` 先渲染，代码块稍后才到。`tests/learn.spec.mjs` 要等 `[data-testid="docs-chapter"] [data-testid="doc-code-block"]`，不能只等外壳。

**C++ 宿主编译和聚合初始化。** 本机 g++ 的头文件路径可能和选中的编译器版本不一致。教程里的派生类在 C++14 下不是聚合，`Rect{w,h}` 需要构造函数。这些是写示例时的约束，浏览器里的运行时仍是 clang 8。

**界面文案两套一起改。** 侧栏、工具栏、抽屉、关于弹层、终端状态和下载失败句都在 `src/i18n/messages.ts`。新键要同时有 `zh` 和 `en`，`en` 的类型盖住 `zh` 的键。`t()` 必须在模板或 computed 里读到 `locale`，不然切换语言不刷新。不要为这个再加 vue-i18n。书的 Markdown 不进这张表。只读原因由渲染器写进章节：中文是「仅供阅读」，英文是 “For reading only”。默认是 `zh`。`tests/learn.spec.mjs` 认「返回目录」和「Python 快速入门」，那个用例的浏览器不要预写 `simplecode:locale=en`。

**英文书跟中文书平行。** 中文在 `docs/<book>/*.md`，英文在 `docs/en/<book>/<同一文件名>.md`。章节 id 中文是 `python/index`，英文是 `en/python/index`。frontmatter 的 `language` 仍是书 id。可运行围栏的程序、`expect` 和 `stdin` 与中文相同；注释按书的语言写，中文注释对英文注释。界面是 EN 时读英文目录。整本或单章还没有英文文件时，抽屉显示 “English Quick Start is under construction”，点 “View the Chinese version” 回到中文，界面语言不变。关掉再开，若仍是 EN，再按有没有英文文件决定。

**示例代码只用 ASCII。** 快速入门围栏、`src/samples` 和冒烟用的样例程序里，标识符、字符串、打印结果和数据值都是英文。注释可以本地化：中文书用中文注释，英文书用英文注释。编辑器里未改过的默认示例在「中 / EN」切换时只换注释。`tests/docs-ascii.test.ts` 按语言去掉 `#`、`//`、`/* */`、`--`、`--[[ ]]`、`=begin`/`=end` 之后不允许再出现非 ASCII。`$#` 不是注释。详见 `plan/LEARN.md` §22。

**折叠侧栏放不下标题行控件。** `?` 和「中 / EN」在展开时位于 SimpleCode 右侧。宽度落到 5rem 以下时，标题行控件带 `sidebar-expanded-only`，避免被裁切；折叠后的同一对控件在页脚。页脚的窄栏规则会把 `button` 收成 2rem 方块，语言胶囊要单独放开宽度。

**下载进度条贴在按钮底边。** `LanguageItem` 里 `data-testid="wasm-progress"` 使用 `absolute inset-x-0 bottom-0 h-0.5`，铺满按钮宽度，下沿与按钮下沿对齐。不要再加 `my-[8px]`，也不要把它做成按钮下面的另一行。

**换语言时终端要一起换。** 侧栏从一门语言点到另一门（包括 Linux 和其他语言互切）时，先停掉 WASI、v86、rustc 和 TeaVM，卸掉 xterm 的串口透传和 stdin，清屏，再绑到新运行时。下载或运行途中换走，旧的完成回调不能再写屏幕，也不能把 v86 串口重新接上。Java 正在编译或卡在 `System.in` 时也要 `terminate` 那个 Worker。界面「中 / EN」切换时，下载进度、错误和提示按新语言重画；程序打印的内容留在原处。系统句用消息键存在 `src/core/terminal.ts`，不要先 `t()` 再写进 xterm。

**Java 不是 OpenJDK，也不能从 teavm.org 拉文件。** `compiler.wasm` 要 Wasm GC 和 `wasm:js-string`。四份 pin 在 `scripts/sources.lock.json` 的 `java`，合计 6,896,057 字节。浏览器只 `fetch` 同源 `wasm/java/`。缺文件时终端说明去跑 `./build.sh vendor --java`（页面来自 dist 还要再 `./build.sh build`）。不要把 `compiler.wasm` 登记成 WASI 命令，也不要把它写进 `wasm/manifest.json`。`System.in` 盖掉的是 `TConsoleInputStream` 的 class 文件（`@Import` 模块 `simplecode`），在 TeaVM javac 里重编这份带注解的源码会把编译器打栈溢出。`Scanner` 的桩 class 在内存里追加到 SDK gzip 归档的末尾，不改 pin 住的那份 `compile-classlib-teavm.bin`。`main()` 返回之后 Worker 还要等 `teavmAsync` 的计时器，否则 `Thread.sleep` 后面的输出丢了。Stop 不能等这个计时器。javac 编进 `compiler.wasm` 的是 GPLv2 + Classpath Exception，见 `LICENSES/THIRD_PARTY.md`。

**缺失的 `/wasm` 不能回退成首页。** 没跑 `./build.sh vendor --java` 时，如果开发服务器、preview 或静态站点把 `/wasm/java/compiler.wasm` 回成 `index.html`，响应是 200，并带 `Cache-Control: max-age=86400`。浏览器会把这份 HTML 当成 wasm 缓存一天。磁盘上后来有了正确文件，普通 `fetch` 仍读到旧 HTML，终端却报摘要不一致。`/wasm/**` 找不到文件时要直接 404，并且 `Cache-Control: no-store`。这段中间件要在 `configurePreviewServer` 里当场 `use`；钩子返回的函数排在 SPA fallback 之后，挡不住首页。下载地址带 `?v=`（sha256 前 12 位），先 `cache: "no-cache"`，体积、摘要或 HTML 不对再 `cache: "reload"` 一次。状态不是 2xx、`Content-Type` 是 `text/html`，或正文以 `<!doctype` / `<html` 开头，都算文件缺失：中英文终端说明去跑 `./build.sh vendor --java`（dist 再 build 一次）。体积相同但 sha256 不同才算摘要不一致，并写上期望、实际大小和 sha256。得到的字节数对不上（包括 0 字节）是下载不完整：先 `cache: "reload"` 再拉一次，仍失败就写明得到和期望的字节数以及 sha256，不要写成锁文件不一致。Chrome 开发者工具里的 “0 kB transferred” 是 `transferSize === 0`：`Cache-Control: max-age=86400` 的内存缓存命中，或 service worker `new Response` 重建的响应，都会这样，正文仍可能是完整文件。真正读到 0 字节或短正文时按不完整下载报错。dev 和 preview 自己把 `/wasm/**` 流出去（`Cache-Control: no-cache`，不回 304）。静态站点的 service worker 要删掉 `Content-Encoding`（worker 里的 `fetch` 已经解压，页面再解一次会得到空正文）；原来带编码时连 `Content-Length` 一起删。200 且没有 body 时用 `cache: "reload"` 再请求一次。读流时立刻 `slice()` 每个分块，避免缓冲区被复用后摘要算错。Rust 同源文件、清单里的 wasm / Linux 资源，以及 `manifest.json`，走同一套重试。上游 Rust 地址不加 `?v=`。`./build.sh build` 发现没有 `wasm/java/compiler.wasm` 时警告，构建仍继续。

**Vercel 上 `./build.sh vendor` 会失败。** 构建镜像是 Amazon Linux 2023，没有 root 的 `apt`（包管理是 `dnf`，构建脚本也不装编译器）。仓库不包含 `thirdparty/runno/`，所以 vendor 的第一句就是 `missing thirdparty/runno/langs/python-3.11.3.wasm`，后面的 Lua / Go / Shell / Linux 都还没跑。就算先克隆了 Runno，Linux 在没有 `zstd` 时要 `cc` 和 `make` 才能编 zstd 1.5.7；Lua 要 `make`。编失败后的 `prebuiltUrl` 指向 GitHub Release `wasi-runtimes-1`，这个 Release 没有发布，下载也是失败。Linux 快照和 Runno 的那几份 wasm 以前没有备用文件。处理：`vendor/prebuilt/` 提交 linux-x86_64 上打出来的确定性 gzip tar（`sha256sum -c vendor/prebuilt/SHA256SUMS`）。`./build.sh vendor` 先走原来的构建，失败才解开这些包。Wasm 字节可在浏览器里跑，不按宿主各打一份。darwin-arm64 的 Lua（以及可能的 Shell）会因为 wasi-sdk 的 `libclang_rt.builtins.a` 和 Linux 不同而摘要不同；那份本地构建成功时仍用本地字节，失败时退回包里的 linux-x86_64 参考摘要。`linux-state.zst` 每次 `save_state()` 都不保证同字节，包里钉的是一份能启动的快照。刷新：在 linux-x86_64 上 `./build.sh vendor`、`./build.sh vendor --java`、再 `./build.sh vendor --pack`。

## 计划文件

| 文件 | 内容 |
|---|---|
| `plan/DESIGN.md` | 布局、COOP/COEP、缓存、单色、侧栏 |
| `plan/LANGUAGES.md` | 语言评估、Lua/Go/Shell 的实现记录、Linux §10 的落地结果 |
| `plan/LEARN.md` | 快速入门的结构和 §19 写作标准、Linux 书在 §20、Java 书在 §23 |
| `plan/LEETCODE.md` | 题库模式：入口、题单合并、题解许可证、已下载语言、隐藏题解 |
| `plan/DEEP_LEARNING.md` | Pyodide + NumPy 调研，以及侧栏、运行时、两本书和 vendor 的落地 |
| `plan/learn-research.md` | 教程取材笔记 |

当前书在短节改写之后（PR #1 侧栏，#2 Lua/Go，#3 可移植构建，#4 JS/TS，#5–#7 快速入门与清单，#8 Shell，#9 书改名，#10 Go 短节，#11 其余九本，#12 Linux 方案，#13 Rust 调研，#14 Linux 运行时）。Rust 的实现记录在 `plan/LANGUAGES.md` §11.10。Linux 的落地记录在 §10。Java 的调研在 §12，侧栏实现按 §12.12。
