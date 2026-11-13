# LeetCode 入口范围，以及按《动手学深度学习》重排 DeepLearning

> 状态：只定计划，本文件不改运行时代码。日期：2026-11-13。
> 基线：`main`。侧栏 14 个运行时、题库模式、Pyodide 深度学习短课都已在 `main` 上。
> 相关文档：[plan/LEETCODE.md](LEETCODE.md)、[plan/DEEP_LEARNING.md](DEEP_LEARNING.md)、[plan/LEARN.md](LEARN.md) §19–§23、[plan/LANGUAGES.md](LANGUAGES.md)。

本文件做两件事。

1. 工具栏「快速入门 | LeetCode」今天对每一个侧栏分区都出现。下面列出全部分区，规定哪些留下、哪些拿掉，以及要改的代码和测试。
2. 把 [d2l-ai/d2l-zh](https://github.com/d2l-ai/d2l-zh)（`config.ini` 的 release 2.0.0）的正文和 PyTorch 代码迁进 DeepLearning 这一本，并在**已经落地**的 Pyodide + NumPy + `minitorch.py` Worker 里能跑多少跑多少。不换框架，不接 CDN。

2026-11-13 按评审意见改过课程范围。第 1–3 节的 LeetCode 取舍没有改。

## 和现有计划的关系

[plan/DEEP_LEARNING.md](DEEP_LEARNING.md) 第 0–10 节说明为什么运行时是 Pyodide 314 + NumPy 2.4.6、放在 Worker 里、文件全部同源。本文件沿用这个运行时，不重开 TF.js、ONNX、官方 PyTorch 的选型。

第 11 节是已经落地的短课：侧栏 id `numpy`、两本书 `dl` 与 `numpy`、`src/pyodide/minitorch.py`、Fashion-MNIST 的 5000/1000 子集、中英各 16 个文件。打包、Worker、Cache API 和 `vendor --pyodide` 的退路继续沿用第 11.1、11.2、11.4、11.5 节。

本文件接替第 11.3 节的课程范围。短课的 16 章会被 d2l-zh 的目录换掉，而不是在后面再叠一套。NumPy 书 `docs/numpy/` 保持不动，仍是数组那一本。

[plan/LEETCODE.md](LEETCODE.md) §7 已经规定选择器里哪些语言能跑题。那个集合不改。本文件补上的是工具栏按钮：今天按钮不看这个集合。

---

## 目录

1. LeetCode 入口今天出现在哪
2. 哪些分区留下，哪些拿掉
3. LeetCode 要改的代码和测试
4. d2l-zh 每一节能不能在浏览器里跑
5. 运行时：扩展 minitorch，不换框架
6. 数据与体积
7. 许可证：正文以 CC BY-SA 迁入为主方案
8. 文件怎么放、代码怎么移植
9. 分阶段
10. 风险与验收

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

## 4. d2l-zh 每一节能不能在浏览器里跑

单位是 `d2l-zh` `master` 上的一个 `.md` 文件。不含 `*_origin.md`，不含 `chapter_references/`。引言里的 1.1–1.9 是同一个 `index.md` 里的标题，不拆成九行。这样数下来是 **139** 节。

三档的意思：

| 档 | 含义 |
|---|---|
| **完整** | 算法、模型宽度和书上的 PyTorch 页一致。数据用书上的那一份（或书自己已经裁过的 tiny 包）。训练若有，默认轮数够看出损失下降，不是几十步的演示。图改成把将要画的数打印出来 |
| **缩减** | 同一套算法迁到 minitorch 上能跑，但数据张数、句长、分辨率或轮数低于书。原因写在表里。默认 Run 仍然是一段真训练或真前向，不是空壳 |
| **只读** | 正文迁入，代码标 `norun`。这一节的要点是 CUDA、多机、外部服务，或一份超过预算的预训练权重。只打印 `cpu` 不算把该节跑起来 |

读者点 Run 的默认块可以超过文档冒烟的 60 秒，上限按 **3 分钟** 来设计。超过的，默认块标 `smoke=skip`，同一函数再给一个步数更少的块给 `docs-smoke`。两块都是真计算。

依据：本仓库已测过 Pyodide 里 5000 张、784-128-10、10 个 epoch 的 MLP 约 8.6 秒（[plan/DEEP_LEARNING.md](DEEP_LEARNING.md) §3.3）。卷积和字符级 RNN 还没有同样的测量。表里写「外推」的行，实现时若一次 Run 超过 3 分钟，把该行从完整改成缩减，不把超时调高。

合计：**完整 59，缩减 39，只读 41**。能在浏览器里执行的是 98 节（71%）。只读里约一半是章首、前言、安装、符号和附录，没有训练代码。

### 4.1 前言、安装、符号、引言

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 前言 | `chapter_preface/index.md` | 只读 | 无 | 没有可执行程序 |
| 安装 | `chapter_installation/index.md` | 只读 | 无 | conda、CUDA、`pip install torch`。这一行的运行时已经在页面里 |
| 符号 | `chapter_notation/index.md` | 只读 | 无 | 符号表 |
| 引言（含 1.1–1.9） | `chapter_introduction/index.md` | 只读 | 无 | 概念和讨论题 |

### 4.2 预备知识

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_preliminaries/index.md` | 只读 | 无 | 目录 |
| 数据操作 | `ndarray.md` | 完整 | `minitorch.Tensor`、NumPy | 创建、索引、运算。缺的归约和广播补进 minitorch |
| 数据预处理 | `pandas.md` | 缩减 | `csv` + NumPy | 不装 pandas。同一张缺失值表用标准库做完，正文保留 |
| 线性代数 | `linear-algebra.md` | 完整 | NumPy | 矩阵乘和范数，无训练 |
| 微积分 | `calculus.md` | 完整 | NumPy | 差商。曲线改成打印采样点 |
| 自动微分 | `autograd.md` | 完整 | `Tensor.backward` | 标量反传已有。补上本节的 `sum`、`reshape`。不记录梯度的拷贝充当 detach |
| 概率 | `probability.md` | 完整 | NumPy | 抽样写在块内的 `Generator` 上，不碰会跨 Run 留下的全局随机流 |
| 查阅文档 | `lookup-api.md` | 缩减 | minitorch | `help()` 只能看到 Worker 里已有的对象。查 `torch.nn` 文档的段落标 `norun` |

### 4.3 线性神经网络

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_linear-networks/index.md` | 只读 | 无 | 目录 |
| 线性回归 | `linear-regression.md` | 完整 | NumPy | 合成数据，书就是这个规模 |
| 线性回归从零开始 | `linear-regression-scratch.md` | 完整 | SGD | 合成直线，步数按书 |
| 线性回归的简洁实现 | `linear-regression-concise.md` | 完整 | `nn.Linear`、`optim.SGD` | 这两个已经有 |
| softmax 回归 | `softmax-regression.md` | 完整 | `softmax` | 公式和小批量数值 |
| 图像分类数据集 | `image-classification-dataset.md` | 完整 | 全量 Fashion-MNIST | 训练 6 万、测试 1 万。gzip 的图像约 30.8 MB，加标签后约 31 MB。打印形状和各类张数 |
| softmax 从零开始 | `softmax-regression-scratch.md` | 完整 | 全量 Fashion + 反传 | 线性模型。按 8.6 秒那次测量外推，全量上多个 epoch 仍在 3 分钟内。实测若超时，改为缩减轮数 |
| softmax 的简洁实现 | `softmax-regression-concise.md` | 完整 | `nn.Linear` | 同上 |

### 4.4 多层感知机

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_multilayer-perceptrons/index.md` | 只读 | 无 | 目录 |
| 多层感知机 | `mlp.md` | 完整 | ReLU | 激活的数值例子 |
| 从零开始实现 | `mlp-scratch.md` | 缩减 | 全量 Fashion | 模型和书相同。6 万张约是已测 5000 张的 12 倍数据，10 个 epoch 会超过 3 分钟。默认 2–3 个 epoch，跑到损失明显下降 |
| 简洁实现 | `mlp-concise.md` | 缩减 | `Sequential` | 同上 |
| 欠拟合和过拟合 | `underfit-overfit.md` | 完整 | 合成多项式 | 书就是合成数据 |
| 权重衰减 | `weight-decay.md` | 完整 | SGD + L2 | 合成 |
| 暂退法 | `dropout.md` | 完整 | Dropout | 掩码由调用方传入，或用块内 Generator，`expect` 才稳定 |
| 前向传播、反向传播和计算图 | `backprop.md` | 完整 | 小计算图 | 书的例子不大 |
| 数值稳定性和初始化 | `numerical-stability-and-init.md` | 完整 | softmax、初始化 | 大指数先减最大值 |
| 环境和分布偏移 | `environment.md` | 完整 | 合成偏移 | 书用合成数据 |
| 预测房价 | `kaggle-house-price.md` | 完整 | 两份 csv，共 0.91 MB | 线性模型，数据小 |

### 4.5 深度学习计算

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_deep-learning-computation/index.md` | 只读 | 无 | 目录 |
| 层和块 | `model-construction.md` | 完整 | `Module`、`Sequential` | 嵌套前向 |
| 参数管理 | `parameters.md` | 完整 | `parameters()` | 已有遍历。补共享和访问 |
| 延后初始化 | `deferred-init.md` | 缩减 | 构造时定形状 | 书的要点是第一次 forward 才建参数。这里做不到惰性建参数。可运行块改成「构造完成后参数已经在」，修改说明里写明 |
| 自定义层 | `custom-layer.md` | 完整 | 子类 `Module` | |
| 读写文件 | `read-write.md` | 完整 | 同一次 Run 里的 npz | 例子是保存再加载。Worker 的 MEMFS 会跨 Run 留下，不把这当成节与节之间的契约 |
| GPU | `use-gpu.md` | 只读 | 无 | 没有 CUDA |

### 4.6 卷积神经网络

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_convolutional-neural-networks/index.md` | 只读 | 无 | 目录 |
| 从全连接层到卷积 | `why-conv.md` | 完整 | 小矩阵 | |
| 图像卷积 | `conv-layer.md` | 完整 | 互相关 | 小核小图，数值和书上的手算一致。实现用 im2col，不逐元素用 Python 循环扫整张图 |
| 填充和步幅 | `padding-and-strides.md` | 完整 | 同上 | |
| 多输入多输出通道 | `channels.md` | 完整 | 同上 | |
| 汇聚层 | `pooling.md` | 完整 | MaxPool、AvgPool | |
| LeNet | `lenet.md` | 缩减 | 全量文件在磁盘上，默认 2000 张、1 epoch | 纯 NumPy 卷积还没有计时。结构与书相同。若 6 万张按书的轮数能在 3 分钟内结束，实现时改成完整 |

### 4.7 现代卷积神经网络

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_convolutional-modern/index.md` | 只读 | 无 | 目录 |
| AlexNet | `alexnet.md` | 缩减 | 小分辨率上的前向加一步反传 | 书把 Fashion 放到 224。这个分辨率在纯 NumPy 上训不动。层类型和通道思路保留，输入改 28 或 64 |
| 使用块的网络（VGG） | `vgg.md` | 缩减 | VGG 块 | 小分辨率，一步 |
| 网络中的网络（NiN） | `nin.md` | 缩减 | 1×1 卷积 | 同上 |
| 含并行连结的网络（GoogLeNet） | `googlenet.md` | 缩减 | 并行分支的前向 | 小分辨率 |
| 批量规范化 | `batch-norm.md` | 缩减 | BatchNorm | 公式用小张量按书跑完。接到网上的训练用 LeNet 那一档的张数 |
| 残差网络（ResNet） | `resnet.md` | 缩减 | 残差块 | 形状和一步反传按书。完整训练不做 |
| 稠密连接网络（DenseNet） | `densenet.md` | 缩减 | 稠密块前向 | 小通道 |

### 4.8 循环神经网络

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_recurrent-neural-networks/index.md` | 只读 | 无 | 目录 |
| 序列模型 | `sequence.md` | 完整 | 合成序列 | |
| 文本预处理 | `text-preprocessing.md` | 完整 | `timemachine.txt` 全文，0.18 MB | |
| 语言模型和数据集 | `language-models-and-dataset.md` | 完整 | 全文词表和采样 | |
| 循环神经网络 | `rnn.md` | 完整 | 一个时间步 | 公式 |
| 从零开始实现 | `rnn-scratch.md` | 缩减 | 全文，少数 epoch | 书上常是数百 epoch 的字符模型。纯 Python 循环做不到那个轮数。默认训到能接上若干字符 |
| 简洁实现 | `rnn-concise.md` | 缩减 | `nn.RNN` | 同上 |
| 通过时间反向传播 | `bptt.md` | 完整 | 长度 3 的序列 | 书就是这个规模 |

### 4.9 现代循环神经网络

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_recurrent-modern/index.md` | 只读 | 无 | 目录 |
| 门控循环单元（GRU） | `gru.md` | 缩减 | 时间机器全文，少数 epoch | |
| 长短期记忆网络（LSTM） | `lstm.md` | 缩减 | 同上 | |
| 深度循环神经网络 | `deep-rnn.md` | 缩减 | 两层，少数 epoch | |
| 双向循环神经网络 | `bi-rnn.md` | 缩减 | 同上 | |
| 机器翻译与数据集 | `machine-translation-and-dataset.md` | 完整 | `fra-eng.zip` 整包，3.42 MB | 读取、词元、词表用全部句对 |
| 编码器-解码器架构 | `encoder-decoder.md` | 完整 | 小张量上的接口 | |
| 序列到序列学习 | `seq2seq.md` | 缩减 | 全量压缩包在磁盘上 | 训练只用较短的句子（长度不超过 10 的一部分）和少数 epoch |
| 束搜索 | `beam-search.md` | 完整 | 写死的分数或上一节的小模型 | 算法本身不依赖 GPU |

### 4.10 注意力机制

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_attention-mechanisms/index.md` | 只读 | 无 | 目录 |
| 注意力提示 | `attention-cues.md` | 只读 | 无 | 概念。书上的图不迁，链回 zh.d2l.ai |
| 注意力汇聚：Nadaraya-Watson | `nadaraya-waston.md` | 完整 | 合成一维数据 | 书就是这个规模。上游文件名是 `waston` |
| 注意力评分函数 | `attention-scoring-functions.md` | 完整 | 小矩阵 | |
| Bahdanau 注意力 | `bahdanau-attention.md` | 缩减 | 缩减后的 seq2seq | |
| 多头注意力 | `multihead-attention.md` | 完整 | 小矩阵 | 书的例子不大 |
| 自注意力和位置编码 | `self-attention-and-positional-encoding.md` | 完整 | 短序列 | |
| Transformer | `transformer.md` | 缩减 | 时间机器上的小训练 | 结构按书。一个 epoch 若超过 3 分钟，再降宽度，并写进修改说明 |

### 4.11 优化算法

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_optimization/index.md` | 只读 | 无 | 目录 |
| 优化和深度学习 | `optimization-intro.md` | 只读 | 无 | 概念 |
| 凸性 | `convexity.md` | 完整 | 小函数 | |
| 梯度下降 | `gd.md` | 完整 | 同上 | |
| 随机梯度下降 | `sgd.md` | 完整 | 同上 | |
| 小批量随机梯度下降 | `minibatch-sgd.md` | 完整 | `airfoil_self_noise.dat`，0.06 MB | 书用前 1500 行 |
| 动量法 | `momentum.md` | 完整 | Momentum | |
| AdaGrad | `adagrad.md` | 完整 | AdaGrad | |
| RMSProp | `rmsprop.md` | 完整 | RMSProp | |
| Adadelta | `adadelta.md` | 完整 | Adadelta | |
| Adam | `adam.md` | 完整 | 已有 Adam | 补上书里的偏差修正 |
| 学习率调度器 | `lr-scheduler.md` | 完整 | 包一层现有优化器 | |

### 4.12 计算性能

这 8 节都是只读。Worker 里没有 MXNet 的 hybridize、CUDA 流、多 GPU 和参数服务器。

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_computational-performance/index.md` | 只读 | 无 | 目录 |
| 编译器和解释器 | `hybridize.md` | 只读 | 无 | 针对 MXNet 的混合编程 |
| 异步计算 | `async-computation.md` | 只读 | 无 | CUDA 流 |
| 自动并行 | `auto-parallelism.md` | 只读 | 无 | 多设备 |
| 硬件 | `hardware.md` | 只读 | 无 | GPU 硬件叙述 |
| 多 GPU 训练 | `multiple-gpus.md` | 只读 | 无 | |
| 多 GPU 的简洁实现 | `multiple-gpus-concise.md` | 只读 | 无 | |
| 参数服务器 | `parameterserver.md` | 只读 | 无 | 多机 |

### 4.13 计算机视觉

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_computer-vision/index.md` | 只读 | 无 | 目录 |
| 图像增广 | `image-augmentation.md` | 完整 | Fashion 的 uint8 | 翻转和裁剪用 NumPy。不装 torchvision |
| 微调 | `fine-tuning.md` | 只读 | 无 | ImageNet 预训练 ResNet，再加 261 MB 的 `hotdog.zip`。两样都不进预算 |
| 目标检测和边界框 | `bounding-box.md` | 完整 | 几何 | |
| 锚框 | `anchor.md` | 完整 | IoU | |
| 多尺度目标检测 | `multiscale-object-detection.md` | 完整 | 特征图尺寸 | |
| 目标检测数据集 | `object-detection-dataset.md` | 缩减 | 香蕉图的抽样 | `banana-detection.zip` 是 139 MB，不整包。抽 64 张训练和 16 张验证，存成原始字节。读取接口仍是图像张量加框 |
| 单发多框检测（SSD） | `ssd.md` | 缩减 | 上面的 80 张 | 1 个 epoch 的损失。输入边长可从 256 降到 64，层的类型保留 |
| 区域卷积神经网络（R-CNN） | `rcnn.md` | 只读 | 无 | 依赖预训练骨干和区域提议 |
| 语义分割和数据集 | `semantic-segmentation-and-dataset.md` | 只读 | 无 | `VOCtrainval_11-May-2012.tar` 是 2000 MB |
| 转置卷积 | `transposed-conv.md` | 完整 | 小张量 | 数值按书 |
| 全卷积网络 | `fcn.md` | 缩减 | 一张小标签图的前向 | 不训 VOC |
| 风格迁移 | `neural-style.md` | 只读 | 无 | 要 VGG 的预训练特征 |
| 实战 Kaggle：CIFAR-10 | `kaggle-cifar10.md` | 缩减 | `kaggle_cifar10_tiny.zip` 整包，2.47 MB | 这就是书用的小子集，数据不另砍。轮数减少 |
| 实战 Kaggle：狗的品种 | `kaggle-dog.md` | 缩减 | 再抽一次的子集，上限 8 MB | `kaggle_dog_tiny.zip` 是 35.8 MB，单份就超预算。目录整理的代码按书跑 |

### 4.14 自然语言处理：预训练

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_natural-language-processing-pretraining/index.md` | 只读 | 无 | 目录 |
| 词嵌入（word2vec） | `word2vec.md` | 完整 | 一个窗口的数值 | |
| 近似训练 | `approx-training.md` | 完整 | 负采样的小例子 | |
| 用于预训练词嵌入的数据集 | `word-embedding-dataset.md` | 完整 | `ptb.zip` 整包，1.98 MB | |
| 预训练 word2vec | `word2vec-pretraining.md` | 缩减 | PTB 全文 | 负样本数和 epoch 减少 |
| 全局向量的词嵌入（GloVe） | `glove.md` | 缩减 | PTB 的共现 | 不下载 69 MB 的 50 维或 134 MB 的 100 维向量。加权回归走若干步 |
| 子词嵌入 | `subword-embedding.md` | 缩减 | 时间机器上的 BPE | 不加载预训练 fastText |
| 词的相似性和类比 | `similarity-analogy.md` | 缩减 | 自己训出的小向量 | 不用 GloVe 6B |
| BERT | `bert.md` | 缩减 | 窄一些的编码器，一次前向 | 结构按书，宽度和句长减小 |
| 用于预训练 BERT 的数据集 | `bert-dataset.md` | 缩减 | WikiText-2 或抽段 | 不用 2468 MB 的 `wiki.en.zip`。WikiText-2 打包时再量，不超过 15 MB 就整包，否则抽段落。MLM 和 NSP 的张量要能造出来 |
| 预训练 BERT | `bert-pretraining.md` | 缩减 | 2 句、1 步、窄隐藏层 | 证明 MLM+NSP 的损失能反传。不复现书里的预训练模型 |

### 4.15 自然语言处理：应用

| 节 | 上游文件 | 档 | 要什么 | 原因 |
|---|---|---|---|---|
| 章首 | `chapter_natural-language-processing-applications/index.md` | 只读 | 无 | 目录 |
| 情感分析及数据集 | `sentiment-analysis-and-dataset.md` | 缩减 | 每类 200 条，上限 2 MB | aclImdb 整包大约 80 MB。本次 HEAD 得到 502，打包时再量。读取和截断按书 |
| 情感分析：循环神经网络 | `sentiment-analysis-rnn.md` | 缩减 | 这份抽样 | 少数 epoch |
| 情感分析：卷积神经网络 | `sentiment-analysis-cnn.md` | 缩减 | 同上 | |
| 自然语言推断与数据集 | `natural-language-inference-and-dataset.md` | 缩减 | 几千对，上限 3 MB | SNLI 整包大约 90 MB。本次没有量到体积。解析按书 |
| 自然语言推断：注意力 | `natural-language-inference-attention.md` | 缩减 | 这份抽样 | 少数 epoch |
| 微调 BERT | `finetuning-bert.md` | 只读 | 无 | 要预训练 BERT 权重 |
| 自然语言推断：微调 BERT | `natural-language-inference-bert.md` | 只读 | 无 | 同上 |

### 4.16 附录

这 7 节都是只读：没有可以在这个 Worker 里执行的程序。`d2l.md` 迁入后，页首加一张「书上的名字 → minitorch」对照。对照是我们写的。

| 节 | 上游文件 | 档 |
|---|---|---|
| 章首 | `chapter_appendix-tools-for-deep-learning/index.md` | 只读 |
| 使用 Jupyter | `jupyter.md` | 只读 |
| 使用 Amazon SageMaker | `sagemaker.md` | 只读 |
| 使用 Amazon EC2 | `aws.md` | 只读 |
| 选择服务器和 GPU | `selecting-servers-gpus.md` | 只读 |
| 为本书做贡献 | `contributing.md` | 只读 |
| `d2l` API 文档 | `d2l.md` | 只读 |

---

## 5. 运行时：扩展 minitorch，不换框架

推荐就一条：**继续用现在的 Pyodide Worker、NumPy 2.4.6 和 `src/pyodide/minitorch.py`。把 d2l-zh 里 PyTorch 那一栏的代码改写成对 minitorch 的调用。** 侧栏 id 仍是 `numpy`。不新增第二种深度学习运行时。

`minitorch.py` 今天大约 360 行，已有 `Tensor`、标量 `backward`、`nn.Linear` / `ReLU` / `Sequential`、`softmax`、`cross_entropy`、`optim.SGD` / `Adam`、Fashion 子集读取。为了盖住上表里的 98 节，按这个顺序往同一文件里加，每加一个就在 `tests/minitorch.test.mjs` 里对数值梯度：

1. 预备知识和线性模型还缺的运算：`sum`、`mean`、`reshape`、索引、`exp`、`log`。
2. `Module.train` / `eval`，以及由调用方提供掩码的 `Dropout`。
3. `Conv2d`（im2col）、`MaxPool2d`、`AvgPool2d`、`Flatten`、`BatchNorm`。
4. `Embedding`、单层 `RNN` / `GRU` / `LSTM`（batch 在外）。
5. 多头注意力和书上那个 Transformer 块用到的线性层、残差和层规范化。
6. `Momentum`、`AdaGrad`、`RMSProp`、`Adadelta`，以及一个学习率倍率。
7. 参数存成 npz 再读回。词表、按批量切片、准确率、计时。这些小工具若从 `d2l/torch.py` 搬来，文件头按第 7 节的 MIT-0 写；优先对着 minitorch 重写，让库本身仍是一份 MIT 代码。

书里的 `matplotlib` 调用改成打印那组将要画的数。不把 matplotlib 的 wheel 打进侧栏。`torchvision` 不装。Fashion-MNIST 用 idx 字节自己读。香蕉、CIFAR、狗的抽样在打包时写成和现有 `fashion-mnist.bin` 一样的原始字节，避免再钉一个图像解码 wheel。

`d2l-zh` 的笔记本有 MXNet、PyTorch、TensorFlow、Paddle 四栏。只移植 PyTorch 那一栏。另外三栏不复制。

下面这些都能让更多 API 原样出现，但都不采用。它们要么换掉已经进页面的运行时，要么不能训练，要么必须在运行时访问网络。

| 方案 | 一句话 |
|---|---|
| [mmtftr/pyodide-pytorch](https://github.com/mmtftr/pyodide-pytorch) 的 torch 2.13 wasm wheel（MIT，非官方，绑某一次 Pyodide ABI） | 自动求导和 `torch.nn` 是真的，但要换 Pyodide 构建、再加 sympy 等依赖，wheel 比现在整份运行时大一个数量级，WebGPU 路径还是试验性的 |
| PyPI 上的 `d2l` 1.0.3 | `setup.py` 写 MIT-0，却钉 numpy 1.23.5、matplotlib、pandas、requests、jupyter，并 `import torch`。和现有 NumPy 2.4.6 冲突，而且 `requests` 会去拉 S3 |
| celsowm/torch-pyodide、pyborch、tinygrad、ONNX Runtime Web、TF.js | 前两个是另一套 PyTorch 外形或必须有 WebGPU；ONNX 和 TF.js 做不了书里从零反传的那些节。第 0–10 节已经把后两样排除 |

---

## 6. 数据与体积

构建期可以下载，浏览器运行时不行。`src/pyodide/worker.ts` 只 `writeFile` 启动时交进来的字节。新数据走和 `fashion-mnist.bin` 相同的锁：`scripts/sources.lock.json` 钉 sha256，`./build.sh vendor --pyodide` 放进同源目录。不要把 d2l 的 `download()` 留在可运行块里，那个函数访问 `http://d2l-data.s3-accelerate.amazonaws.com/`。

体积是 2026-11-13 对上游 URL 做的 HEAD。`Content-Length` 如下。

| 文件 | 字节 | 决定 |
|---|---|---|
| Fashion-MNIST 训练图像 gz | 26.42 MB | 要。加测试图像 4.42 MB 和两份标签（几十 KB），整套约 **31 MB**。换成全量，换掉现在的 5000/1000 子集 |
| `timemachine.txt` | 0.18 MB | 要，全文 |
| `kaggle_house_pred_{train,test}.csv` | 0.46 + 0.45 MB | 要 |
| `airfoil_self_noise.dat` | 0.06 MB | 要 |
| `fra-eng.zip` | 3.42 MB | 要，整包 |
| `ptb.zip` | 1.98 MB | 要，整包 |
| `kaggle_cifar10_tiny.zip` | 2.47 MB | 要，这就是书用的子集 |
| 香蕉抽样 | 上游整包 **139.44 MB** | 不要整包。抽 64+16 张，存成原始字节，**上限 8 MB** |
| 狗的品种抽样 | 上游 tiny 包 **35.79 MB** | 不要整包。再抽，**上限 8 MB** |
| IMDb 抽样 | 整包大约 80 MB（HEAD 得到 502） | **上限 2 MB** |
| SNLI 抽样 | 整包大约 90 MB（这次没量到） | **上限 3 MB** |
| WikiText-2 | 打包时再 HEAD | 不超过 15 MB 就整包，否则抽段，**上限 2 MB** |
| `hotdog.zip` | 261.29 MB | 不要 |
| `VOCtrainval_11-May-2012.tar` | 1999.64 MB | 不要 |
| `wiki.en.zip` | 2468.01 MB | 不要 |
| `glove.6B.50d.zip` / `100d` | 69.18 / 134.30 MB | 不要 |
| `glove.42B.300d.zip` | 未再请求，公开副本是数 GB | 不要 |

现有 Pyodide 七个文件是 **21,201,739** 字节，侧栏显示 **20.2 MB**。上表「要」的整包加上四个抽样上限，大约 **31 + 0.2 + 0.9 + 0.1 + 3.4 + 2.0 + 2.5 + 8 + 8 + 2 + 3 + 2 ≈ 63 MB**。

**数据预算上限：压缩或原始字节合计 64 MB。加上现有运行时，这一行不超过约 85 MB。** 64 MB 装不下狗的 36 MB tiny 包，也装不下 69 MB 的 GloVe，所以那两份用抽样或自训的小向量代替，而不是把预算放到 100 MB 以上。

全量 Fashion 不要一次性变成 float64。60,000×784 的 float64 大约 376 MB。磁盘上保持 uint8，每个批量再转成 float32。现有 `datasets.fashion_mnist` 会把子集整表转成 float64，全量读入时改掉这个行为。

抽样文件在 `NOTICE` 里写明原文件名、原张数、留下的张数和 sha256。许可证跟原数据走：Fashion-MNIST 是 MIT；房价 csv、PTB、Tatoeba 的 fra-eng、UCI 机翼、CIFAR tiny、狗的子集在钉文件时把上游许可证抄进 `NOTICE`，对不上再分发条件的就不钉，该节改成只读。这一条在打包脚本里检查，不在计划里猜每一份的 SPDX。

---

## 7. 许可证：正文以 CC BY-SA 迁入为主方案

核对日期 2026-11-13，两个仓库的默认分支都是 `master`。

| 上游 | 实际写了什么 |
|---|---|
| `d2l-zh` 的 `config.ini` | `copyright = 2022, All authors. Licensed under CC-BY-SA-4.0 and MIT-0.` `release = 2.0.0`，`origin_repo = d2l-ai/d2l-en` |
| `d2l-zh` 根目录 `LICENSE` | Apache-2.0 全文。没有 `LICENSE-SAMPLECODE`。README 不再声明许可证 |
| `d2l-en` 的 README | 书的正文是 CC BY-SA 4.0（根目录 `LICENSE`）。笔记本里的示例代码是 Amazon 2019 的一份修改版 MIT（`LICENSE-SAMPLECODE`） |
| 两边的 `setup.py` | 包 `d2l` 的 `license='MIT-0'` |

中文是英文的译本。英文正文是 CC BY-SA 4.0，译本不能靠根目录那份 Apache-2.0 甩掉相同方式共享。本仓库今天的 `docs/sources.yaml` 把 `d2l-zh` 登记成 Apache-2.0、`adapt: true`，这个登记是错的。`docs/dl` 与 `docs/en/dl` 里 `11-dropout.md`、`12-batchnorm.md`、`13-rnn.md`、`14-attn.md`、`15-train.md` 引用了它。抽查过丢弃那一章，正文是自写短节，不是粘贴。登记本身仍然要改。

代码和正文分开：

- **正文**按 `config.ini` 和英文上游，是 **CC BY-SA 4.0**。
- **`d2l/` 里的 Python，以及 `config.ini` 点名的代码**，按 **MIT-0**。从英文笔记本而不是从 `d2l-zh` 抄来的函数，改用 `LICENSE-SAMPLECODE` 那份 Amazon 版权。主来源是中文仓库，所以默认走 MIT-0。
- 根目录 Apache-2.0 文件不作为正文许可证。

### 7.1 主方案：把正文迁进来

这是默认要做的。中文进 `docs/dl/`，英文进 `docs/en/dl/`。英文句子取 `d2l-en` 里对应的节，不把中文再译一遍。文件名跟 `d2l-zh` 走，这样中英路径相同。英文仓库把线性网络拆成了两章、后面还多了强化学习等章；那些多出来的章不迁，因为主本是 `d2l-zh` 2.0.0。

两套目录都放：

- `LICENSE`：CC BY-SA 4.0 的法律文本，或指向 https://creativecommons.org/licenses/by-sa/4.0/ 的全文副本。
- `NOTICE.md`：作者 Aston Zhang、Zachary C. Lipton、Mu Li、Alexander J. Smola；`config.ini` 的 “2022, All authors”；钉住的上游 commit；https://zh.d2l.ai 和 https://d2l.ai ；CC BY-SA 4.0 的 URI；一份修改清单。

修改清单至少包括：只保留 PyTorch 那一栏；调用从 `torch` 改成 `minitorch`；图改成打印；部分数据是抽样；没有 CUDA 的节标了 `norun`；书上的图没有搬进来。

义务，按许可证原文的条件说：

1. **署名。** 保留作者、版权声明、许可证名称和 URI、免责声明的指向、原书链接。标出我们改过。
2. **相同方式共享。** `docs/dl/` 和 `docs/en/dl/` 里的正文以 CC BY-SA 4.0 再分发。改写这些段落的人必须用 CC BY-SA 4.0（或兼容许可证）发布改编物，不能加额外限制。仓库其余部分不因此变成 CC BY-SA：根 README 用一段话写明只有这两个目录是。`minitorch.py` 若是对着 API 重写的，保持项目自己的 MIT；从 `d2l/torch.py` 搬来的函数在文件头写 MIT-0 和上游路径。
3. **代码块双重许可。** 整篇 Markdown 的正文是 CC BY-SA。代码块同时按 MIT-0 提供，和 `config.ini` 对代码的声明一致。只把代码块拿去用，不触发相同方式共享。改正文则触发。
4. **不得暗示背书。** 页面写「改编自《动手学深度学习》」，不写官方译本，不把 Cambridge University Press、Amazon 或 NVIDIA 写成本站的背书。书名可以出现在署名里。CC 不授予商标。
5. **技术性修改**（为了能跑而改调用）本身不构成改编；改写句子构成。两种都在 `NOTICE` 里分开列。

`sources.yaml` 换成：

| id | license | adapt | 用途 |
|---|---|---|---|
| `d2l-zh-text` | CC-BY-SA-4.0 | true | 中文正文，目录 `docs/dl/` |
| `d2l-en-text` | CC-BY-SA-4.0 | true | 英文正文，目录 `docs/en/dl/` |
| `d2l-code` | MIT-0 | true | `d2l-zh` 的 `d2l/*.py` 和 PyTorch 栏 |
| `d2l-en-sample-code` | MIT（Amazon 2019，见 `LICENSE-SAMPLECODE`） | true | 只有从英文笔记本抄函数时才引用 |

删掉现在的 `d2l-zh`（Apache-2.0、`adapt: true`）。`LICENSES/THIRD_PARTY.md` 增加一节，链到上述 `LICENSE` 和 `NOTICE`。

这一本不再受 [plan/LEARN.md](LEARN.md) 的节长上限（中文每节 400 字、英文 280 词）和「连续 60 个汉字不跨书重复」。那些规则是为了自写短课不要粘贴别处的原文。这里正文就是上游的。`tests/docs-length.test.ts` 和跨书去重对 `dl` 跳过。代码仍只用 ASCII，中文注释按现有测试剥掉后再查。图不放进 `docs/`，渲染器会把 `docs/` 下不认识的目录当成新书。

### 7.2 备选：正文自己写

若不想在仓库里放一个 CC BY-SA 的目录，就不要搬句子。章序仍按第 4 节，句子和示例字符串自己写。`d2l-zh-text` 与 `d2l-en-text` 改成 `adapt: false`，只出现在延伸阅读的链接里。代码仍可以按 MIT-0 移植。节长和跨书去重恢复生效，139 个上游文件不能原样落地，能写进抽屉的是短课规模的子集。这和「把内容迁进来」不是同一件事。没有选定这个备选之前，按第 7.1 节做。

---

## 8. 文件怎么放、代码怎么移植

`scripts/docs/render.ts` 今天只读 `docs/dl/*.md` 这一层。迁入后目录是：

```
docs/dl/LICENSE
docs/dl/NOTICE.md
docs/dl/chapter_preface/index.md
docs/dl/chapter_linear-networks/linear-regression-scratch.md
…
docs/en/dl/LICENSE
docs/en/dl/NOTICE.md
docs/en/dl/chapter_linear-networks/linear-regression-scratch.md
```

渲染器要走进 `chapter_*`，跳过 `LICENSE` 和 `NOTICE.md`。章节顺序跟 `d2l-zh` 的 `index.md` 目录，不按文件名排序。`chapter` 编号在整本书里连续，第 0 章仍可以是前言。现有扁平的 16 个 `docs/dl/*.md` 在第一批正文落地时删掉，避免两套目录并存。

每个可运行节至少两个 `numpy` 围栏：一个是第 4 节写的默认规模，长了就 `smoke=skip`；一个是同一函数、更少步，给 60 秒的 `docs-smoke`。只读节的围栏标 `norun`，旁边用一句话写原因（中文「仅供阅读」由渲染器产生，原因写在正文里）。

围栏语言继续是 `numpy`，不要写成 `python`，否则会走到 WASI CPython。

---

## 9. 分阶段

每一阶段单独的 PR。中文正文和英文正文分提交。运行时扩展和对应的章节可以在同一阶段，但卷积不要和半本 NLP 混在一个 PR 里。

| 阶段 | 内容 | 体积 | 这一阶段结束时 |
|---|---|---|---|
| 0 | 本计划 | 无 | PR 里只有计划 |
| 1 | 第 1–3 节的 LeetCode 按钮。与课程无关，可以先做 | 无 wasm | 五个分区看不到 LeetCode |
| 2 | 第 7.1 节的 `LICENSE`、`NOTICE`、`sources.yaml`、`THIRD_PARTY.md`。渲染器认识 `chapter_*`。节长和跨书去重对 `dl` 跳过。迁入前言、引言、安装、符号（4 节只读） | 无 | 抽屉里能打开署名和第一章，许可证文件在目录里 |
| 3 | minitorch 补到线性模型和优化器。钉上 Fashion 全量、房价 csv、机翼数据。迁入预备知识、线性神经网络、多层感知机、优化算法 | 数据大约 32 MB。侧栏从 20.2 MB 升到约 52 MB | 完整 7+5+8+10 节里属于这四章的可运行节落地（线性 7 完整、预备 5 完整 + 2 缩减、MLP 8 完整 + 2 缩减、优化 10 完整）。softmax 在全量上训练 |
| 4 | `Conv2d`、汇聚、`BatchNorm`。迁入深度学习计算、两章卷积。LeNet 用 2000 张 | 无新的大文件 | 现代网络至少能做小分辨率的前向和一步反传 |
| 5 | RNN、GRU、LSTM、注意力、Transformer 块。钉上时间机器和 fra-eng | +3.6 MB | 机器翻译的数据节读全量句对；seq2seq 用短句训练 |
| 6 | 第 4.13 节里能跑的视觉节。香蕉和狗的抽样、CIFAR tiny。只读的微调、R-CNN、VOC、风格迁移同时把正文迁入 | 抽样和 tiny 包大约 21 MB，仍在 64 MB 数据预算内 | 锚框和转置卷积按书跑；检测在 80 张图上出损失 |
| 7 | PTB、WikiText 抽样、IMDb 抽样、SNLI 抽样。迁入第 14、15 章。BERT 微调两节只迁正文 | 大约 9 MB | word2vec 在 PTB 上训若干步；BERT 预训练是 1 步反传 |
| 8 | 计算性能 8 节和附录 7 节，全部只读正文 | 无 | 139 节都在抽屉里 |

阶段 3 结束时侧栏大约 52 MB，阶段 6 之后接近 85 MB 的上限。某一份抽样超过自己的上限，就减少张数，不提高 64 MB。

---

## 10. 风险与验收

| 风险 | 处理 |
|---|---|
| 把 Apache-2.0 的根文件当成正文许可证 | 只认第 7 节。`sources.yaml` 里那条旧登记删掉 |
| 相同方式共享被读成整个仓库都是 CC BY-SA | 根 README 写明只有 `docs/dl/` 和 `docs/en/dl/`。代码块另以 MIT-0 提供 |
| 全量 Fashion 转成 float64 把内存吃满 | 磁盘 uint8，批量再转 float32 |
| 卷积或字符 RNN 一次 Run 超过 3 分钟 | 该节从完整改成缩减，不提高冒烟超时 |
| Worker 的 MEMFS 和 NumPy 全局随机流跨 Run 留下 | 可运行块自洽。随机数用块内 Generator |
| 英文目录和中文 2.0.0 不一致 | 文件名跟中文仓库。英文多出来的章不迁 |
| 节长测试挡住长文 | 阶段 2 就对 `dl` 跳过。不把书删成 400 字一节 |
| 数据许可证在 HEAD 时还没逐份核对 | 钉文件之前写入 `NOTICE`。条件不允许再分发的，该节改只读 |

阶段 1 的验收就是第 3.3 节的测试。

阶段 2 之后：`docs/dl/LICENSE` 和 `docs/en/dl/LICENSE` 存在；`NOTICE.md` 有作者、上游 commit、修改清单和 CC BY-SA 4.0 的链接；`sources.yaml` 不再出现 Apache-2.0 的 `d2l-zh`。

阶段 3 到 8：第 4 节的 139 行都有对应文件。档是完整或缩减的节，默认块能在浏览器里跑完并打印出 `expect` 里的子串；只读节的围栏是 `norun`。`tests/minitorch.test.mjs` 覆盖新算子。`tests/pyodide-no-remote.test.ts` 仍然禁止运行时出现 `cdn.jsdelivr.net`、`cdn.pyodide.org` 和 `d2l-data.s3-accelerate.amazonaws.com`。数据字节合计不超过 64 MB，侧栏这一行不超过约 85 MB。

`./build.sh build` 和 `./build.sh test` 在每个阶段合并前都要通过。
