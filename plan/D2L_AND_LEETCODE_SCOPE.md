# LeetCode 入口范围，以及按《动手学深度学习》重排 DeepLearning

> 状态：只定计划，本文件不改运行时代码。日期：2026-11-13。
> 基线：`main`。侧栏 14 个运行时、题库模式、Pyodide 深度学习短课都已在 `main` 上。
> 相关文档：[plan/LEETCODE.md](LEETCODE.md)、[plan/DEEP_LEARNING.md](DEEP_LEARNING.md)、[plan/LEARN.md](LEARN.md) §19–§23、[plan/LANGUAGES.md](LANGUAGES.md)。

本文件做两件事。

1. 工具栏「快速入门 | LeetCode」今天对每一个侧栏分区都出现。下面列出全部分区，规定哪些留下、哪些拿掉，以及要改的代码和测试。
2. DeepLearning 这一本按开源书 *Dive into Deep Learning*（《动手学深度学习》，Aston Zhang、Zachary C. Lipton、Mu Li、Alexander J. Smola）重排。运行时仍是已经落地的 Pyodide + NumPy + 自写 `minitorch.py`，不换框架，不接 CDN。

## 和现有计划的关系

[plan/DEEP_LEARNING.md](DEEP_LEARNING.md) 第 0–10 节仍是运行时选型的依据：Pyodide 314 + NumPy 2.4.6、Worker、同源文件、不要 PyTorch / TF.js / ONNX。那些结论不变。

第 11 节是已经落地的短课：侧栏 id `numpy`、两本书 `dl` 与 `numpy`、`src/pyodide/minitorch.py`、Fashion-MNIST 子集、中英各 16 个文件。运行时、打包和测试路径继续沿用第 11.1、11.2、11.4、11.5 节。

本文件接替第 11.3 节的**课程范围**和第 11.6 节里「写完这 16 章即结束」的含义。短课里的线性回归、softmax、Fashion 子集、丢弃、卷积一眼、注意力一眼，会按 d2l 的章序拆开或并进新目录，不另起一个侧栏，也不再引入第 7 节否掉的 JS 轨道、scikit-learn 和 Transformers.js。

[plan/LEETCODE.md](LEETCODE.md) §7 已经规定选择器里哪些语言能跑题。那个集合不改。本文件补上的是工具栏按钮：今天按钮不看这个集合。

---

## 目录

1. LeetCode 入口今天出现在哪
2. 哪些分区留下，哪些拿掉
3. LeetCode 要改的代码和测试
4. d2l 仓库、许可证、署名义务
5. 浏览器里能跑什么
6. 正文怎么写、章节怎么对照
7. 分阶段
8. 体积
9. 风险
10. 验收

---

## 1. LeetCode 入口今天出现在哪

侧栏一行是一个运行时，不是一本书。DeepLearning 和 NumPy 共用运行时 id `numpy`（`scripts/languages.config.mjs`，界面名 `DeepLearning`，短标签 `DL`）。抽屉里的 `docs-book-dl` / `docs-book-numpy` 只切换快速入门，不切换 LeetCode。

LeetCode 只有一个入口：`EditorToolbar.vue` 始终挂 `StudyModeSwitch.vue`。右段 `data-testid="study-mode-leetcode"` 没有 `v-if`。14 个运行时都会看到它，中英文界面一样，窄屏只剩图标。

点下去之后的行为（`src/stores/study.ts` 的 `pickLeet`，`src/stores/leetcode.ts` 的 `align`）：

| 当前运行时 | 抽屉里的语言胶囊 | 实际发生的事 |
|---|---|---|
| 已下载，且 id 在 `LEETCODE_RUNTIMES` | 只列出已下载 ∩ 可跑题集合 | 停在当前语言 |
| 不在集合里，但别的可跑题语言已经缓存 | 那些已缓存的语言 | `align()` 调用 `languageStore.select`，切到侧栏顺序里第一门候选。人还停在 DeepLearning / Linux 上时，点 LeetCode 会离开这一行 |
| 没有任何已缓存语言 | 不出现 | 空状态「还没有已下载的语言」 |
| 已缓存的语言都不在集合里 | 不出现 | 空状态「已下载的运行时里还没有能跑这些题的语言」 |

`LEETCODE_RUNTIMES` 在 `src/docs/leetcode.ts`：

`python`、`ruby`、`quickjs`、`clang`、`clangpp`、`lua`、`go`、`rust`、`java`。

选择器本来就排除 `sqlite`、`php-cgi`、`shell`、`linux`。`numpy` 不在名单里，所以 DeepLearning / NumPy 也进不了胶囊，但工具栏按钮仍在。模式记在 `localStorage` 键 `simplecode:study-mode`。在 Python 里选过 LeetCode 再点到 DeepLearning，按钮保持选中；抽屉若开着，内容仍是题库，而不是深度学习目录。

书的 Markdown 里没有第二套 LeetCode 入口。章节不链到题库。

快速入门按钮对全部 14 行都保留。本文件不动它。

---

## 2. 哪些分区留下，哪些拿掉

留下的标准：这门语言是通用编程语言，而且当前宿主真能跑题库这种「从标准输入读入、打印结果」的程序。题解文件可缺。缺了时题目页已经写「这门语言还没有题解」，用户仍能用编辑器里的代码跑样例。

拿掉的是：跑不了这套样例，或者这一行根本不是算法语言。按钮拿掉，不要改成禁用态。

| 侧栏顺序 | 运行时 id | 界面名 | 短标签 | 今天工具栏 LeetCode | 今天胶囊（已下载时） | 决定 | 原因 |
|---|---|---|---|---|---|---|---|
| 1 | `python` | Python | Py | 显示 | 可出现 | **留下** | WASI CPython 3.11，`input()` / `sys.stdin`。题解主路径 |
| 2 | `ruby` | Ruby | Rb | 显示 | 可出现 | **留下** | Ruby 3.2，`gets` |
| 3 | `quickjs` | JS/TS | JS | 显示 | 可出现 | **留下** | 通用语言。还没有 `javascript.js`，因为 [plan/LEETCODE.md](LEETCODE.md) §7.3 的 stdin 探测没做。按钮留下；探测通过之前不加题解文件 |
| 4 | `sqlite` | SQLite | SQL | 显示 | 不出现 | **拿掉** | SQL 引擎，不是这套算法题的宿主 |
| 5 | `clang` | C | C | 显示 | 可出现 | **留下** | clang 8，`scanf` / `printf`，`-Werror` |
| 6 | `clangpp` | C++ | C++ | 显示 | 可出现 | **留下** | 同一套 clang。`throw`、线程、`<filesystem>`、缺 `__lttf2` 的 `std::sort` 仍按现有题解规则避开，不因此拿掉按钮 |
| 7 | `php-cgi` | PHP | PHP | 显示 | 不出现 | **拿掉** | 通用语言，但 `php://stdin` 和 `php://input` 读不到 WASI 标准输入，样例跑不起来 |
| 8 | `lua` | Lua | Lua | 显示 | 可出现 | **留下** | Lua 5.4，`io.read` |
| 9 | `go` | Go | Go | 显示 | 可出现 | **留下** | Yaegi 0.16.1，`os.Stdin` |
| 10 | `shell` | Shell | Sh | 显示 | 不出现 | **拿掉** | wasi-sh 没有算术展开和函数 |
| 11 | `rust` | Rust | Rs | 显示 | 可出现 | **留下** | weblings，单文件 `main.rs`。冒烟默认仍不跑 Rust 题解 |
| 12 | `java` | Java | Jv | 显示 | 可出现 | **留下** | TeaVM。类名必须是 `Main`，没有正则。正则题继续不提供 Java 题解 |
| 13 | `linux` | Linux | Lx | 显示 | 不出现 | **拿掉** | v86 客户机。题库包装不进串口 |
| 14 | `numpy` | DeepLearning | DL | 显示 | 不出现 | **拿掉** | 这一行打开 DeepLearning 和 NumPy 两本书，运行时是 Pyodide。题解按 WASI CPython 写和测，不在这条 Worker 上跑。Pyodide 能执行 Python，不构成把题库放进这一区的理由 |

`numpy` 这一行拿掉之后，DeepLearning 书和 NumPy 书同时看不到 LeetCode。两本书没有各自的工具栏。

不把 `numpy` 加进 `LEETCODE_RUNTIMES`。不给 PHP、Shell、SQLite、Linux 补题解包装。PHP 的标准输入若以后在 WASI 上读得到，再单独把 `php-cgi` 加回这个集合，并同时恢复按钮。在那之前两处一起关。

---

## 3. LeetCode 要改的代码和测试

单一名单仍然是 `LEETCODE_RUNTIMES`。工具栏、胶囊、`align()` 都读它，不另写一份「显示按钮」的数组。

### 3.1 行为

选中的运行时不在 `LEETCODE_RUNTIMES` 里时：

1. `StudyModeSwitch.vue` 不渲染 `study-mode-leetcode`。`study-mode-learn` 仍在，外层 `study-mode` 组保留。
2. 若 `simplecode:study-mode` 已是 `leetcode`，进入该运行时时把**当前模式**改回 `learn`，并打开快速入门的逻辑改走 `docs.show()`。不要调用 `align()`，也不要 `select()` 到 Python 或其他已缓存语言。
3. 这个回退写回 `localStorage`，避免 `Ctrl/Cmd+J` 在 DeepLearning 上又打开题库。回到 Python 之后，用户再点一次 LeetCode。不记住「上次在不可用分区之前的模式」另开一个键。
4. `pickLeet()` 在当前运行时不可用时直接返回。防止别的调用方再次触发 `align()`。
5. 抽屉 `data-mode` 在这种分区上只能是 `learn`。
6. 文案不新增。空状态两句留在「人主动打开了题库、但没有可用语言」的路径上；按钮拿掉之后，DeepLearning 不再走到那两句。

可用运行时上的按钮、胶囊、题解隐藏、样例对照，保持 [plan/LEETCODE.md](LEETCODE.md) 的现状。

### 3.2 要动的文件

| 文件 | 改动 |
|---|---|
| `src/components/study/StudyModeSwitch.vue` | 右段按当前运行时是否属于 `LEETCODE_RUNTIMES` 渲染 |
| `src/stores/study.ts` | 监听选中语言；不可用时把模式收回 `learn`，且不调用 `align` |
| `src/stores/leetcode.ts` | `pickLeet` 的守卫放在 study store；这里确认 `align` 只在模式已经是 leetcode 且当前语言可用时被调用 |
| `src/docs/leetcode.ts` | 名单本身不增不减。旁边用一行注释写明：这既是胶囊集合，也是工具栏按钮集合 |

不改 `docs/leetcode/` 的题面和题解，不改 `scripts/leetcode/`。

### 3.3 测试

| 测试 | 断言 |
|---|---|
| `tests/leetcode-unit.test.ts` | `LEETCODE_RUNTIMES` 恰好是上表九个 id，且不含 `sqlite`、`php-cgi`、`shell`、`linux`、`numpy` |
| `tests/numpy-ui.spec.mjs` | 选中 `lang-numpy` 后，`study-mode-leetcode` 的个数是 0，`study-mode-learn` 仍在。`docs-book-dl` 与 `docs-book-numpy` 仍可切换。再点 `lang-ruby`，LeetCode 按钮回来 |
| 新的一段，放在 `tests/ui-chrome.spec.mjs` 或单独的 `tests/leetcode-scope.spec.mjs` | 对 `sqlite`、`php-cgi`、`shell`、`linux`、`numpy` 各点一次，按钮个数为 0。预先写入 `localStorage['simplecode:study-mode']='leetcode'` 再点 `lang-numpy`：侧栏仍是 `numpy`（没有被 `align` 拉走），抽屉 `data-mode` 是 `learn` |
| `tests/learn.spec.mjs` | 默认语言是 Python，现有题库流程继续跑，两个按钮都在，几何检查仍包含 `study-mode-leetcode` |

`./build.sh test` 里已经会跑这些文件。这一改动不需要新的 wasm，也不跑 `docs-smoke` 的全部书才能证明按钮藏了。合并前仍按仓库规矩跑完整的 `./build.sh build` 和 `./build.sh test`。

---

## 4. d2l 仓库、许可证、署名义务

核对日期 2026-11-13，默认分支都是 `master`。

### 4.1 三份上游

| 上游 | 位置 | 版本 | 许可证文件实际写了什么 |
|---|---|---|---|
| 英文书 | [d2l-ai/d2l-en](https://github.com/d2l-ai/d2l-en) | GitHub Release **v1.0.3**（2023-08-18）。`master` 在此之后还有提交，最近一次推送 2024-08-18 | README「License Summary」：书的正文是 **CC BY-SA 4.0**，全文在根目录 `LICENSE`。笔记本里的示例和参考代码是一份**改写过的 MIT**，全文在 `LICENSE-SAMPLECODE`。GitHub 把仓库标成 Other（NOASSERTION），因为不是单一许可证 |
| 中文书 | [d2l-ai/d2l-zh](https://github.com/d2l-ai/d2l-zh) | `config.ini` 的 `release = 2.0.0`。`origin_repo = d2l-ai/d2l-en`，翻译者标记为 aws | 根目录 `LICENSE` 是 **Apache-2.0** 全文，没有 `LICENSE-SAMPLECODE`。同一仓库的 `config.ini` 写着 `copyright = 2022, All authors. Licensed under CC-BY-SA-4.0 and MIT-0.` README 不再声明许可证 |
| Python 包 `d2l` | 两仓库的 `d2l/` 与 `setup.py`；PyPI [d2l 1.0.3](https://pypi.org/project/d2l/) | 包版本 **1.0.3**（`d2l/__init__.py`） | `setup.py` 和 PyPI 元数据都写 **MIT-0**。依赖钉死为 `jupyter==1.0.0`、`numpy==1.23.5`、`matplotlib==3.7.2`、`matplotlib-inline==0.1.6`、`requests==2.31.0`、`pandas==2.0.3`，英文仓库的 `setup.py` 另加 `scipy==1.10.1`。导入方式是 `from d2l import torch` / `mxnet` / `tensorflow` / `jax`。中文仓库另有 Paddle 标签 |

`LICENSE-SAMPLECODE` 的原文以 `Copyright 2019 Amazon.com, Inc. or its affiliates.` 开头，允许使用、复制、修改、合并、出版、分发、再许可和销售，并带通常的免责声明。它**没有**标准 MIT 那句「再分发时必须保留版权声明和许可声明」。文件头上的版权行仍然是这份代码的一部分。从笔记本里搬来的函数，文件头保留这行版权，并注明来自 `d2l-en` 的 `LICENSE-SAMPLECODE`、版本 v1.0.3。

### 4.2 为什么不能按 Apache-2.0 搬中文正文

中文仓库同时出现两份说法：根上的 Apache-2.0，和 `config.ini` 里的 CC BY-SA 4.0 + MIT-0。英文正文是 CC BY-SA 4.0。译本是该许可证下的改编物，ShareAlike 跟着译本走。根目录那份 Apache-2.0 不能当成「中文段落可以不按相同方式共享」的许可。

本仓库今天的登记是错的，要在改书之前改掉：

```yaml
d2l-zh:
  title: Dive into Deep Learning
  url: https://github.com/d2l-ai/d2l-zh
  license: Apache-2.0
  adapt: true
```

`docs/dl/` 与 `docs/en/dl/` 里引用这个 id 的是 `11-dropout.md`、`12-batchnorm.md`、`13-rnn.md`、`14-attn.md`、`15-train.md`（中英各一份）。抽查 `11-dropout.md`：正文是自写的短节和写死的掩码，不是粘贴的 d2l 段落。登记仍然把整本书标成可改编的 Apache 文本，这个标记本身要删。

### 4.3 正文与代码分开登记

按 [plan/LEARN.md](LEARN.md) §6.4：`adapt: false` 只出现在延伸阅读的链接里，不搬原文。

| id | 标题 | URL | license | adapt | 用途 |
|---|---|---|---|---|---|
| `d2l-en-text` | Dive into Deep Learning | https://github.com/d2l-ai/d2l-en | CC-BY-SA-4.0 | **false** | 英文正文。只在章末延伸阅读里链接，链到对应的 `https://d2l.ai/` 小节 |
| `d2l-zh-text` | 动手学深度学习 | https://github.com/d2l-ai/d2l-zh | CC-BY-SA-4.0 | **false** | 中文正文。同样只链接 `https://zh.d2l.ai/`。备注里写明根目录 Apache-2.0 文件不覆盖正文 |
| `d2l-sample-code` | Dive into Deep Learning sample code | https://github.com/d2l-ai/d2l-en/blob/v1.0.3/LICENSE-SAMPLECODE | MIT（Amazon 2019 的修改版，见该文件） | **true** | 只有真的搬了笔记本里的函数才引用，并保留版权行 |
| `d2l-package` | d2l Python package | https://github.com/d2l-ai/d2l-en/blob/v1.0.3/setup.py | MIT-0 | **true** | 只有从 `d2l/*.py` 搬了帮助函数才引用。默认不搬，见 §5 |

删掉现在的 `d2l-zh`（Apache-2.0、`adapt: true`）。上述五章的 `sources` 改成 `d2l-zh-text`，并确认正文里没有整段与上游相同的句子。渲染器今天只解析 `adapt`，并不扫描雷同。验收时用人工对照这五章，而不是假装 CI 已经会报警。

不采用「整章改成 CC BY-SA 4.0 然后粘贴原文」。那样做要同时满足署名和相同方式共享：

- 署名：作者 Zhang、Lipton、Li、Smola；版权声明；CC BY-SA 4.0 的 URI；指向原书的链接；标明改过。
- ShareAlike：改编后的段落本身必须以 CC BY-SA 4.0（或兼容许可证）再分发。写进 `docs/dl/` 的一章会变成改编物。本仓库其余十四本书是自写的，不能因为这一本被卷进相同方式共享。
- CC 不授予商标。书名可以在延伸阅读里出现，页面不写成官方译本，也不暗示 Cambridge University Press、Amazon 或 NVIDIA 为本站背书。
- 为了在技术上能跑而做的修改，CC 第 2(a)(4) 条本身不构成改编。改写讲解则构成。

自写短节沿用现在的标准：中文引言不超过 180 个汉字，每节去掉代码后 1 到 400 个汉字；英文引言不超过 140 个词，每节 1 到 280 个词；每章至少三个 `###`、两个带 `expect` 的可运行块。想法和章序可以跟 d2l 对齐，句子和示例字符串自己写。示例代码只用 ASCII。中英注释分开写。跨书连续 60 个汉字不重复的检查继续覆盖这一本。

图不入库。书里的 SVG/PNG 属于 CC BY-SA 作品。界面也没有彩色插图的位置。需要图的地方改成打印出来的数。

`LICENSES/THIRD_PARTY.md` 在真正搬入样本代码或 `d2l/*.py` 片段时才加一节，写上 Amazon 版权行或 MIT-0，以及 v1.0.3 的链接。只放延伸阅读链接时，`sources.yaml` 就够，不必把整份 CC 法律文本再复制进仓库。

---

## 5. 浏览器里能跑什么

### 5.1 现有栈，不换

| 组件 | 现状 | 本计划 |
|---|---|---|
| 运行时 | Pyodide，Worker，`src/pyodide/worker.ts` | 不换。`fetch` 已按文件名返回已下载字节，`loadPackage("numpy")` 不访问网络 |
| NumPy | 2.4.6，同源 wheel | 保持。d2l 包钉的 numpy 1.23.5 与此冲突，所以不能把 PyPI 上的 `d2l` 装进 Worker |
| 教学库 | `src/pyodide/minitorch.py`，Worker 启动时写到 `/opt/simplecode/minitorch.py` | 继续扩这一份。已有 `Tensor`、`nn.Linear` / `ReLU` / `Sequential`、`softmax`、`cross_entropy`、`optim.SGD` / `Adam`、`datasets.fashion_mnist` |
| 数据 | `/data/fashion-mnist.bin`，训练 5000、测试 1000，魔数 `0x314E4D46`，归因 `/data/FASHION.txt` | 继续用子集。不换成 6 万张全量 |
| 标准输入 | `SharedArrayBuffer` + `Atomics.wait` | 不变 |
| 文件系统 | 同一个 Worker 的 MEMFS 会跨多次 Run 留下来，直到 `cancelPyodide()`（换语言或停掉） | 可运行块必须自洽。不写「先跑上一节把文件存下来」 |
| 下载 | `./build.sh vendor --pyodide`，七个文件合计 **21,201,739** 字节，侧栏显示 **20.2 MB**，Cache API `simplecode-wasm-v1` | 默认不再加 wheel |

书里的「简洁实现」在上游是 `torch.nn` / MXNet / TensorFlow / Paddle。这里的简洁实现就是 `minitorch.nn`。每一章用一句话说明它不是 PyTorch，然后给出能跑的子集。不在围栏里写 `import torch`。

不引入的依赖：

| 依赖 | 原因 |
|---|---|
| PyTorch、MXNet、TensorFlow、JAX、Paddle | 没有能交给当前 Worker 的浏览器构建。第 0–10 节已经排除 |
| PyPI 上的 `d2l` 整包 | 依赖 jupyter、matplotlib、pandas、requests、scipy，并导入上述框架。`requests` 会去拉 S3 上的数据，页面没有外网下载这条路 |
| matplotlib | 教学图改成打印标量。Pyodide 上的 matplotlib 及其数据文件是额外的数 MB 到十几 MB，不进默认包 |
| pandas | 预处理用 NumPy 或标准库 `csv`。不把 pandas wheel 打进侧栏 |
| GPU / CUDA / WebGPU | Worker 里的 NumPy 是 CPU。`torch.cuda`、多 GPU、参数服务器不模拟 |

`d2l` 包里值得留下的是与框架无关的小工具：合成数据、累加器、准确率、按批量切片。这些在 `minitorch.py` 里用自己的句子重写。只有当数值例子必须和书上某一函数逐行对应时，才按 §4.3 从 v1.0.3 复制并保留版权行。默认路径是重写，不是 vendoring `d2l/torch.py`。

### 5.2 数据

d2l 的 `download` 指向他们的数据桶。浏览器运行时不发这个请求。要进可运行块的文件，走和 `fashion-mnist.bin` 相同的路径：锁里钉 sha256，`vendor --pyodide` 放进 `wasm/pyodide/`，Worker 在启动时 `writeFile`。

| 数据 | 上游大约体积 | 决定 |
|---|---|---|
| Fashion-MNIST 子集（已有） | 含在 21.2 MB 里 | 留下。softmax / MLP / LeNet 都用它，张数在围栏里再截到几百 |
| Fashion-MNIST 全量（60k + 10k） | 压缩后约 30 MB | 不引入。全量训练在纯 NumPy 上也超过文档冒烟的 60 秒 |
| *The Time Machine* 文本 | 约 200 KB，原书公有领域 | 第 5 阶段若写语言模型，再钉一份短摘录或全文本。摘录我们自己从公有领域文本切，不把 d2l 数据桶里的派生文件当成无许可证 |
| 房价 CSV | 约 100 KB 量级 | 不默认引入。Kaggle 比赛数据的再分发要单独核对；核对通过之前这一节只做合成回归 |
| CIFAR-10 | 约 170 MB | 不引入 |
| ImageNet / Stanford Dogs | GB 级 | 不引入 |
| GloVe、BERT 权重 | 数百 MB | 不引入 |
| 目标检测、VOC、风格迁移图片 | 数 MB 到更大 | 不引入 |

可运行训练块沿用现在 `07-fashion.md` 的尺度：固定初值（不要依赖会跨 Run 留下来的 `np.random` 全局状态），几百张图，至多几个 epoch，`expect` 只要求出现 `loss` 或 `acc` 这类稳定子串。`tests/docs-smoke.mjs` 对单块的上限是 **60 秒**。超过这个上限的训练改成 `norun`，旁边写明原因是浏览器里的步数太长。

### 5.3 章的可行性

英文以 `d2l-en` 的 `master` 目录为准（v1.0.3 之后又加了强化学习等章）。中文以 `d2l-zh` 的 `master`（`config.ini` release 2.0.0）为准。两边前半不一致：英文把线性网络拆成 linear-regression 与 linear-classification，中文仍是一章「线性神经网络」。英文 `master` 多出来的章，中文仓库没有对应目录。

「可跑」指可以用 NumPy 或扩展开的 `minitorch` 在 60 秒内跑完一个块。「只读」指 `norun`，用一小节说明浏览器里缺什么，并链接原书。「不做」指不写进 `docs/dl/`，只在概览的延伸阅读里点到书名。

| 阶段 | d2l-en | d2l-zh 2.0.0 | 可行性 |
|---|---|---|---|
| 3 | 前言、符号 | 前言、符号 | 可跑的只有「这一册用 minitorch，不是 PyTorch」。安装 Jupyter、SageMaker 不做 |
| 3 | 1 引言 | 1 引言 | 只读短章：问题类型用我们自己的两句话，不搬案例名单 |
| 3 | 2 预备知识：数据操作、线性代数、微积分、自动微分、概率 | 2.1、2.3–2.6 | 可跑。数据操作与现有 NumPy 书重叠的部分写成几节并指向 NumPy 书，不把 `docs/numpy/` 再抄一遍 |
| 3 | 2.2 数据预处理（pandas） | 2.2 | 可跑的改写成 NumPy。不讲 `pandas.read_csv` 去下载文件 |
| 3 | 2.7 查阅文档 | 2.7 | 只读：说明没有 `torch` 文档可查，`help()` 只能看到已装进 Pyodide 的对象 |
| 3 | 3 线性回归从零开始 / 简洁实现 | 3.1–3.3 | 可跑。简洁实现 = `nn.Linear` + `optim.SGD` |
| 3 | 3 线性分类、softmax、Fashion-MNIST | 3.4–3.7 | 可跑，数据用现有子集，围栏里再截小 |
| 3 | 4 多层感知机、欠拟合与过拟合、权重衰减、暂退法、数值稳定与初始化 | 4.1–4.8 | 可跑。现有 XOR、螺旋两章并进「欠拟合」或删掉独立文件，避免和 d2l 顺序平行两套 |
| 3 | 4.9 分布偏移、4.10 Kaggle 房价 | 4.9–4.10 | 分布偏移只读。房价在数据许可证核对之前不做 |
| 4 | 5 层和块、参数管理、自定义层 | 5.1、5.2、5.4（英文书叫 builders guide） | 可跑，要先有 `Module` 的 `train` / `eval` 约定（已有 `parameters`） |
| 4 | 5.3 延后初始化、5.5 读写文件、5.6 GPU | 同左 | 延后初始化只读（我们构造时就定形状）。读写文件：同一个程序里写完再读可以跑，跨 Run 的存盘不作为可运行块。GPU 只读 |
| 4 | 6 卷积、填充、通道、汇聚、LeNet | 6 | 可跑，但要先实现 `Conv2d`、`MaxPool2d`。LeNet 只用几十步、很小的通道数 |
| 4 | 7.5 批量规范化、7.6 残差块的前向形状 | 7.5–7.6 | 可跑前向和一两步反传。ResNet 在子集上训练多个 epoch 不做 |
| — | 7.1–7.4、7.7 AlexNet、VGG、NiN、GoogLeNet、DenseNet 的完整训练 | 同左 | 不做。形状演示若超过 60 秒也改为不做 |
| 5 | 8 序列模型、文本预处理、RNN 从零开始的一步 | 8.1–8.5 | 可跑，语料用短摘录。完整语料上的多 epoch 训练只读 |
| 5 | 8.6 简洁实现、8.7 通过时间反传 | 同左 | 简洁实现等 `minitorch` 有单层 RNN 再写成一步数值。BPTT 的公式用一个长度为 3 的例子跑 |
| 5 | 9.1–9.4 GRU、LSTM、深度 RNN、双向 RNN 的一步 | 同左 | 可跑单步。不训练翻译模型 |
| — | 9.5–9.8 机器翻译数据集、编码器-解码器训练、束搜索在真实句子上 | 同左 | 不做。束搜索可以用三行写死的分数跑一个玩具例子，放在第 5 阶段末尾，不拉平行语料 |
| 5 | 10 注意力汇聚、评分函数、多头注意力的小矩阵、Transformer 块的一次前向 | 10.1–10.7（英文目录名是 attention and transformers） | 可跑，序列长度 ≤ 4，头数 2。不训练 |
| — | 10.4 Bahdanau 注意力配翻译训练 | 10.4 | 不做训练。公式用固定张量做一次打分则可以，并入评分函数那一章 |
| 5 | 11 梯度下降、小批量 SGD、动量、AdaGrad、RMSProp、Adam、学习率调度 | 11.3–11.11 | 可跑，目标函数用二次函数或现有的小线性回归。Adam 已经有 |
| 5 | 11.1–11.2 优化与凸性 | 同左 | 只读短节，外加一个二次函数的下降块 |
| — | 12 计算性能（编译器、异步、自动并行、硬件、多 GPU、参数服务器） | 12 | 只读一章，说明 Worker 里没有这些开关。不拆成七个文件 |
| — | 13 计算机视觉（增广、微调、检测、SSD、R-CNN、分割、风格迁移、CIFAR-10、Dogs） | 13 | 不做。微调依赖预训练权重 |
| — | 14 词嵌入、GloVe、BERT 预训练 | 14 | 不做。权重和语料都超出体积和时限 |
| — | 15 情感分析的完整训练、微调 BERT、自然语言推断 | 15 | 不做。若第 5 阶段的 RNN 已经能跑，情感分析也不另开数据集 |
| — | 16 附录：Jupyter、SageMaker、EC2、选 GPU、贡献、d2l API 文档 | 16 | 不做 |
| — | 英文 `master` 才有：强化学习、高斯过程、超参优化、GAN、推荐系统、数学附录 | 中文 `master` 无这些目录 | 不做 |

现有 16 个文件（`index` 加 `01-linear` … `15-train`）在第 3 阶段被这张表换掉，而不是在后面再叠一套。NumPy 书 `docs/numpy/` 保持数组、广播、线性代数那 17 章，不并进 `dl`。

---

## 6. 正文怎么写、章节怎么对照

中英文件名相同。中文在 `docs/dl/<slug>.md`，英文在 `docs/en/dl/<slug>.md`。`chapter` 从 0 连续编号。第 0 章文件名仍是 `index.md`。

围栏语言继续用 `numpy`，映射到运行时 `numpy`。不要把这些块写成 `python`，否则会走到 WASI CPython，`import numpy` 失败。

第 3 阶段的文件（替换现有短课）：

| 文件 | 中文标题 | 对应 d2l-en | 对应 d2l-zh 2.0.0 | 可运行块在测什么 |
|---|---|---|---|---|
| `index.md` | 深度学习入门 | 前言 | 前言 | 点积与一次 `backward`，点明库是 minitorch |
| `01-ndarray.md` | 数据操作 | 2.1 | 2.1 | 形状、按元素加、归约。细节指向 NumPy 书 |
| `02-algebra.md` | 线性代数 | 2.3 | 2.3 | 矩阵乘、范数的一个数 |
| `03-calculus.md` | 导数 | 2.4 | 2.4 | 用差商核对一个多项式在单点的导数 |
| `04-autograd.md` | 自动微分 | 2.5 | 2.5 | 标量 `backward` 的梯度，沿用现有例子的尺度 |
| `05-probability.md` | 概率 | 2.6 | 2.6 | 用写死的样本算均值，不调用未固定的全局随机流 |
| `06-linear-scratch.md` | 线性回归从零开始 | 线性回归 | 3.2 | 合成直线，几步 SGD，`expect` 含 `loss` |
| `07-linear.md` | 线性回归的简洁实现 | 线性回归 | 3.3 | `nn.Linear` + `optim.SGD` |
| `08-softmax.md` | softmax 回归 | 线性分类 | 3.4–3.6 | 三分类的交叉熵下降 |
| `09-fashion.md` | 图像分类数据 | Fashion-MNIST | 3.5 | 保留现有「label 9」和截断后的小训练 |
| `10-mlp.md` | 多层感知机 | 4.1–4.3 | 4.1–4.3 | 一层隐藏层拟合一个写死的小表 |
| `11-capacity.md` | 欠拟合与过拟合 | 4.4 | 4.4 | 多项式次数不同，打印两种 loss。XOR / 螺旋的内容并进这一章或删除 |
| `12-decay.md` | 权重衰减 | 4.5 | 4.5 | L2 项改变一步更新 |
| `13-dropout.md` | 暂退法 | 4.6 | 4.6 | 保留现有写死掩码。随机掩码继续不进 `expect` |
| `14-init.md` | 数值稳定与初始化 | 4.8 | 4.8 | 大指数 softmax 先减最大值 |

第 4 阶段追加，编号接在后面：

| 文件 | 中文标题 | 对应 | 前置 |
|---|---|---|---|
| `15-block.md` | 层和块 | 5.1 | 无新算子 |
| `16-params.md` | 参数 | 5.2 | `Module.parameters` 已有 |
| `17-custom.md` | 自定义层 | 5.4 | 无 |
| `18-conv.md` | 卷积 | 6.2 | `Conv2d` |
| `19-padding.md` | 填充和步幅 | 6.3 | 同上 |
| `20-channels.md` | 多通道 | 6.4 | 同上 |
| `21-pool.md` | 汇聚 | 6.5 | `MaxPool2d` |
| `22-lenet.md` | LeNet 的一小步 | 6.6 | 上述算子；步数少到 60 秒内 |
| `23-batchnorm.md` | 批量规范化 | 7.5 | `BatchNorm` |
| `24-residual.md` | 残差块的形状 | 7.6 | 只做前向，打印形状 |

第 5 阶段再追加：

| 文件 | 中文标题 | 对应 | 前置 |
|---|---|---|---|
| `25-sequence.md` | 序列模型 | 8.1 | 合成序列 |
| `26-tokens.md` | 词元 | 8.2 | 短字符串，不下载语料也成立 |
| `27-rnn.md` | 循环神经网络的一步 | 8.4–8.5 | RNN 单元 |
| `28-gru.md` | 门控循环单元的一步 | 9.1 | GRU 单元 |
| `29-lstm.md` | 长短期记忆的一步 | 9.2 | LSTM 单元 |
| `30-attn-pool.md` | 注意力汇聚 | 10.2 | 合成一维核回归 |
| `31-score.md` | 注意力评分 | 10.3 | 点积分数 |
| `32-mha.md` | 多头注意力 | 10.5 | 长度 ≤ 4 |
| `33-transformer.md` | Transformer 块的一次前向 | 10.7 | 不训练 |
| `34-sgd.md` | 小批量梯度下降 | 11.5 | 现有 SGD |
| `35-momentum.md` | 动量 | 11.6 | 扩 `optim` |
| `36-adam.md` | Adam | 11.10 | 已有 |
| `37-schedule.md` | 学习率调度 | 11.11 | 手写一个阶梯倍率 |

第 6 阶段只加一章只读：

| 文件 | 中文标题 | 内容 |
|---|---|---|
| `38-not-here.md` | 浏览器里不做的部分 | GPU、多卡、检测、BERT、强化学习。每项一行，链到 d2l，围栏标 `norun` |

这一章若凑不满三个 `###` 加两个可运行块，就把「只读说明」拆成三个 `###`，并另给两个与主题相邻、仍然可跑的小块（例如打印 `numpy` 没有 CUDA、一次 CPU 矩阵乘的形状）。不为了凑结构去训练一个空模型。

`minitorch.py` 在第 4、5 阶段要补的符号，按这个顺序，每补一个就在 `tests/minitorch.test.mjs` 里对数值梯度：

1. `nn.Dropout`（训练时用调用方传入的掩码，库内不调用 `np.random`，以便期望值稳定）
2. `nn.Conv2d`、`nn.MaxPool2d`、`nn.Flatten`
3. `nn.BatchNorm1d`（先做一维，够 MLP；卷积用的 2d 规范化若 LeNet 需要再加）
4. `nn.Embedding`、`nn.RNN`、`nn.GRU`、`nn.LSTM`（单层、batch 在外）
5. `optim.Momentum`、`optim.AdaGrad`、`optim.RMSprop`（Adam 已有）
6. 准确率与按索引取批量的两个函数

不实现 `torch.save`、设备参数、`DataLoader` 多进程。

章末延伸阅读的句子固定成两行链接，中文指向 `https://zh.d2l.ai/` 的对应路径，英文指向 `https://d2l.ai/` 的对应路径，并写上 CC BY-SA 4.0。链接是延伸阅读，不是把原文嵌进来。

本地进度存在 `localStorage`，键按章节 slug。删除 `04-xor.md`、`05-spiral.md` 这类文件后，旧 slug 打开时回到目录。这是预期结果，不写迁移。

---

## 7. 分阶段

阶段按依赖排，不按日历。每一阶段单独的 PR，文档按语言（这里是 `dl` 的中文一次、英文一次）分提交。

| 阶段 | 做什么 | 体积变化 | 依赖 | 完成时能看到什么 |
|---|---|---|---|---|
| 0 | 本文件 | 无 | 无 | 计划进 `main` |
| 1 | §3 的按钮范围 | 无 wasm | 无 | DeepLearning、NumPy、SQLite、PHP、Shell、Linux 的工具栏没有 LeetCode；其余九门还有 |
| 2 | 改 `docs/sources.yaml`：删 `d2l-zh` 的 Apache-2.0 / `adapt: true`，改成 §4.3 的四条。五章 frontmatter 改指向 `d2l-zh-text`。人工核对这五章没有整段原文 | 无 | 阶段 0 的许可结论 | 登记和正文义务一致。书的目录还是旧的 16 章 |
| 3 | 用 §6 的 `index` 到 `14-init` 替换 `docs/dl` 与 `docs/en/dl`。不改 `minitorch.py` 的算子集合，除非某一块缺一个已有 API 的薄封装 | 文档几十字节到一两百 KB | 阶段 2 | 快速入门顺序与 d2l 前四章对齐，`docs-smoke` 仍全部在 60 秒内 |
| 4 | 按 §6 的清单实现卷积、汇聚、批量规范化，并写 `15-block` 到 `24-residual` | `minitorch.py` 从大约 360 行增到大约 900 行，仍是文本，不进侧栏 MB | 阶段 3 | LeNet 一小步能在冒烟里打出 `acc` |
| 5 | RNN / GRU / LSTM / 注意力 / 优化器其余算法，以及 `25-sequence` 到 `37-schedule`。语料先用围栏里的短字符串 | 库再增加大约 600 行。若改钉《时间机器》摘录，锁文件里一份小于 300 KB 的文本，侧栏从 20.2 MB 变成约 20.4 MB | 阶段 4 | 单步循环和长度为 4 的注意力能跑；不出现翻译或 BERT |
| 6 | 只读的 `38-not-here.md`。不下载新 wheel | 无 | 阶段 3 即可，不必等 4、5 | 读者能看到哪些章故意没有 |

阶段 4 若 LeNet 的一小步在 headless Chromium 上超过 45 秒（给 60 秒上限留余量），把通道和步数再减，而不是把超时调高。减到无法演示前向时，这一章改成只打印输出形状，训练块标 `norun`。

阶段 5 的优化器可以和阶段 4 并行写库，但书的 PR 仍按阶段合并，避免一篇 PR 里既改卷积又改半本书。

不做的工作，写在这里以免后面的 PR 把它们加回来：matplotlib、pandas、scipy、scikit-learn、PyPI `d2l`、PyTorch、全量 Fashion-MNIST、CIFAR、ImageNet、BERT、GPU 章的可运行块、把题库接进 Pyodide。

---

## 8. 体积

| 项 | 字节 | 决定 |
|---|---|---|
| 现有 Pyodide 七文件 | 21,201,739（界面 20.2 MB） | 保持，是这一行的预算 |
| Fashion 子集 | 已含在上面 | 不换成约 30 MB 的全量 |
| matplotlib + 数据文件 | 数 MB 起，未在本仓库复测 | 不加入 |
| pandas、scipy | 旧调研里 scipy 与 sklearn 一轮约 17 MB 量级 | 不加入 |
| `d2l` 包与 jupyter | 不是 wasm，但 jupyter 在页面里没有用，且会拉网络 | 不加入 |
| 第 5 阶段可选文本 | < 300 KB | 唯一允许的新增数据，且要进清单和锁 |
| `minitorch.py` | 文本，最终大约 1.5–2 千行 | 随 JS 包走，不进 `wasm/manifest.json` 的语言资产 |
| 新章节 Markdown | 每章数 KB，中英合计几十章时大约几百 KB | 可接受。不把 d2l 的 100 多节原样生成进来 |

侧栏百分比的分母是这一行的资产总和。除了可选的小文本，分母保持 21.2 MB。新增文件若走 `kind: "bin"`，`write-manifest.mjs` 会写进不提交的 `wasm/manifest.json`，并要打进 `vendor/prebuilt`。小文本若不到必须进预构建包的程度，优先放在仓库里由 Worker 以 `?raw` 写入，和 `FASHION.txt` 一样，避免为 200 KB 重打 linux 预构建包。

---

## 9. 风险

| 风险 | 后果 | 处理 |
|---|---|---|
| 把中文仓库根上的 Apache-2.0 当成正文许可证 | 改编段落没有按 CC BY-SA 4.0 共享，和英文原书的 ShareAlike 冲突 | 正文 `adapt: false`，只链接。阶段 2 删掉错误登记 |
| `d2l` 包的 `setup.py` 写 MIT-0，笔记本代码却是 Amazon 的修改版 MIT | 搬错文件头 | 搬笔记本片段用 `LICENSE-SAMPLECODE`；搬 `d2l/*.py` 才用 MIT-0。默认不搬 |
| 纯 NumPy 卷积比书上的 GPU 章节慢两个数量级以上 | 冒烟超时，或读者以为页面卡死 | 步数和通道写死在能于 45 秒内结束的规模；超时就改形状演示 |
| Worker 的 MEMFS 和 NumPy 随机状态跨 Run 保留 | 后一块读到前一块的文件或随机流，冒烟顺序一变就失败 | 块内自洽；初值写死；不在可运行块里调用 `np.random.seed` 作为跨块契约 |
| 英文 `master` 与中文 2.0.0 目录不一致 | 中英章节对不上，或读者按中文网站的旧节号找不到 | 文件名以 §6 为准，延伸阅读同时给出两边 URL。英文站多出来的强化学习等章明确不做 |
| 现有五章引用了错误的 `d2l-zh` id | 看起来像已经获得 Apache 改编权 | 阶段 2 改 id，并读一遍正文 |
| 本地阅读进度按 slug 保存 | 删掉 `04-xor.md` 等文件后旧进度回到目录 | 接受，不迁移 |
| QuickJS 按钮留下但没有题解 | 和「拿掉不能跑的语言」看起来不一致 | JS/TS 能写能跑用户自己的程序；缺的是已导入的题解文件，不是入口。探测仍按 LEETCODE.md §7.3 |
| 在 DeepLearning 上点 LeetCode 会 `select` 走 | 阶段 1 之前的现状 | 阶段 1 禁止这条 `align` |

---

## 10. 验收

阶段 1：

- 上表 14 行里，九个留下的运行时看得到 `study-mode-leetcode`，五个拿掉的看不到。
- `localStorage` 里模式为 `leetcode` 时选中 `numpy`：运行时 id 仍是 `numpy`，抽屉是快速入门。
- `tests/learn.spec.mjs` 的题库流程在 Python 上仍通过。
- `./build.sh build` 与 `./build.sh test` 通过。

阶段 2：

- `docs/sources.yaml` 不再出现 `license: Apache-2.0` 的 `d2l-zh`。
- 四条新 id 的 `adapt` 与 §4.3 一致。
- 引用旧 id 的十个 frontmatter（中英各五）已改，且正文没有粘贴的上游段落。

阶段 3 到 6：

- 中英文件名一一对应，`chapter` 连续，第 0 章仍叫 `index.md`。
- 每章至少三个 `###`、两个带 `expect` 的 `numpy` 围栏，除非该块标了 `norun` 并在旁边写了原因。`smoke=skip` 不用于逃避 60 秒训练，训练块直接缩小。
- `tests/docs-ascii.test.ts`、`tests/docs-length.test.ts`、`tests/docs-smoke.mjs` 覆盖新章节。冒烟默认跑 `dl`（Pyodide），单块 60 秒内结束。
- `tests/minitorch.test.mjs` 给每个新算子一个数值梯度。
- `tests/pyodide-no-remote.test.ts` 仍然禁止 `cdn.jsdelivr.net` 和 `cdn.pyodide.org`。新代码不增加运行时 URL。
- 侧栏这一行在不加入可选文本时仍显示 20.2 MB。
- 概览写明：这不是 PyTorch，也不是 d2l 的官方译本；延伸阅读指向原书，许可证是 CC BY-SA 4.0。

任一阶段若要新增二进制，先改 `scripts/sources.lock.json` 的 sha256，再跑 `./build.sh vendor --pyodide`。失败时的预构建包退路与 [plan/DEEP_LEARNING.md](DEEP_LEARNING.md) §11.4 相同。Rust 和 Java 的文档冒烟开关与本计划无关。
