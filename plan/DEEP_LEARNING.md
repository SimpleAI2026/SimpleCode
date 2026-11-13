# SimpleCode 深度学习（Deep Learning）入口调研（v2，含实测）

> 状态：第 0–10 节是运行时调研，原文保留。第 11 节是已经落地的短课（Pyodide、`minitorch.py`、现有 16 章）。课程改由 [D2L_AND_LEETCODE_SCOPE.md](D2L_AND_LEETCODE_SCOPE.md) 接替：仍用这一套 Pyodide + NumPy + minitorch，按 [d2l-zh](https://github.com/d2l-ai/d2l-zh) 的目录和例子重排，正文自己写并链回原书，能跑的节在浏览器里跑。代码可按 MIT-0 或英文笔记本的修改版 MIT 改编并署名。不把 CC BY-SA 正文搬进仓库。v1：2026-10-20 09:0x；v2：2026-10-20 09:1x–09:4x（UTC+8）。
> v2 的版本号、Star 和日期取自 GitHub API、npm registry、PyPI 和 Pyodide lock 文件；体积是**实际下载后**测得；耗时是本机实测。
> 原始日志：`measurements/`（同目录）。没测到的标 **未知/未测**。

## 0. 结论速览

- **Python 首选：Pyodide 314.0.7 + NumPy 2.4.6**，跑在 Web Worker 里；配套 **自写 PyTorch 风格教学库**（MIT/自有许可，几百行）。
  首次加载约 **8.8 MB（brotli）/ 约 20 MB 原始**（含 MNIST 5k 子集）。在 COOP/COEP 页面 + Worker + SharedArrayBuffer 同步 stdin 的组合下，已在 headless Chromium 156 里**跑通**。
- **零下载入门**：现有 WASI CPython 直接跑 micrograd 风格的纯 Python autograd（wasmtime 实测通过）。
- **JS/TS 轨道**：训练用 **TensorFlow.js 4.22.0**（体积只有约 0.4 MB br，但上游已 2 年无新版）；推理用 **ONNX Runtime Web 1.30.0 / Transformers.js 4.3.1**。**jax-js** 值得做 PoC，但本机未实测。
- 置信度：Python 轨道 **高**（关键路径都实测过）；JS 训练选 TF.js 还是 jax-js：**中**。

## 1. 更正记录（v1 → v2）

| # | v1 说法 | 实际（来源） | 影响 |
|---|---|---|---|
| 1 | Pyodide 最新为 0.29.x（0.29.5 于 2026-09-15） | npm `latest` = **314.0.7**（GitHub release 发布于 2026-09-14T05:06Z，即 13:06 UTC+8），版本号已改为跟随 Python 3.14（lock: python 3.14.2, emscripten 5.0.3, ABI `pyemscripten_2026_0`）。0.29.5 / 0.27.8 只是维护分支（2026-09-16） | 选型改用 314.x |
| 2 | Pyodide 内置 NumPy 2.2.5 / sklearn 1.7.0 | 314.0.7：**numpy 2.4.6、scikit-learn 1.8.0、scipy 1.18.0** | — |
| 3 | Pyodide 内置 `autograd` 1.7.0 | 314.0.7 的 lock（357 个包）**不含 autograd**。PyPI 有纯 Python 的 autograd 1.9.1（MIT，51 KB wheel），可用 micropip 安装或自托管 | 不影响 |
| 4 | Pyodide core 5.7 MB | `pyodide-core-314.0.7.tar.bz2` = 6.76 MB。浏览器实际首载 4 个文件合计 **12.90 MB 原始 / 5.21 MB br** | 体积更准确 |
| 5 | ORT Web wasm 14.2 MB、WebGPU 28.3 MB | 这是 unpkg 上的十进制 MB。实测 1.30.0：`ort-wasm-simd-threaded.wasm` 13.58 MiB 原始，**3.48 gzip / 2.25 br**；jsep（WebGPU）27.00 MiB，**6.32 gzip / 3.77 br**。v1 只给原始值，**夸大了实际传输量** | ORT 比预想的轻 |
| 6 | ORT ≈21.9k star | GitHub API：**22,119**。GitHub 最新 release 是 **v1.31.0**（2026-10-09），但 npm `latest` 仍是 **1.30.0**（dev 版为 1.31.0-dev） | — |
| 7 | TF.js 体积“未知” | 实测 tf.min.js + wasm 后端 + 线程 SIMD wasm ≈ **1.96 MB 原始 / 0.42 MB br**；GitHub 最新 release 是 **2024-10-21**，近 90 天 0 commit | 体积很小，但维护风险确认 |
| 8 | wllama 最新 3.4.1 | **3.8.1**（2026-10-02） | — |
| 9 | tinygrad v0.10.2 | **v0.14.0**（2026-08-24），33,776 star | — |
| 10 | TF.js 4.22.0 “发布于 2026-10-21”（v1 的搜索摘要有此说法，正文未采用） | 实际发布于 **2024-10-21** | — |
| 11 | 未提纯 JS autograd 方案 | 补充 **jax-js**（MIT，943 star，0.1.27，2026-10 仍活跃）、torch.js（npm 0.0.1）、tensorgrad（1 star） | 新增候选 |
| 12 | MNIST 许可“需确认” | MNIST 为 **CC BY-SA 3.0**（Keras/TF 文档）；Fashion-MNIST 为 **MIT** | 数据方案调整 |
| 13 | torch-pyodide“未知” | GitHub 仓库 **0 star**，近 90 天 0 commit，PyPI 未声明 license（v0.0.84） | 排除 |
| 14 | Pyodide 不可装 PyPI 二进制 wheel | **PEP 783 已接受**（2026-04-06 决议）：PyPI 接受 `pyemscripten_*` 平台 wheel | 生态利好 |

## 2. 实测环境

- 机器：Intel Xeon（型号未细分），8 vCPU，15 GB RAM（`measurements/cpu.txt`）。
- Node v20.19.2；Python 3.13.5（本机原生）；wasmtime 49.0.4；Playwright 1.64.1 + Chromium headless 156.0.8078.4。
- 压缩：gzip -9；brotli q11（Node zlib）。脚本：`measurements/sizes.mjs`。
- 单位：MiB（1024²）。

## 3. 实测数据

### 3.1 下载体积（`measurements/sizes.md`）

| 组件 | 文件 | 原始 | gzip | brotli |
|---|---|---|---|---|
| Pyodide 314.0.7 core | pyodide.asm.wasm | 9.15 | 3.37 | 2.61 |
| | pyodide.asm.mjs | 1.19 | 0.25 | 0.20 |
| | python_stdlib.zip | 2.43 | 2.39 | 2.37 |
| | pyodide-lock.json + pyodide.mjs | 0.13 | 0.04 | 0.03 |
| | **core 合计** | **12.90** | **6.03** | **5.21** |
| NumPy 2.4.6 wheel | numpy-…pyemscripten_2026_0_wasm32.whl | 2.82 | 2.79 | 2.78 |
| scikit-learn 1.8.0 + scipy 1.18.0 + joblib + threadpoolctl | 4 个 wheel | 17.81 | 17.55 | 17.49 |
| autograd 1.9.1（PyPI） | 纯 Python wheel | 0.05 | 0.05 | 0.05 |
| TF.js 4.22.0 | tf.min.js | 1.40 | 0.35 | 0.28 |
| | tf-backend-wasm.min.js | 0.14 | 0.03 | 0.03 |
| | tfjs-backend-wasm{,-simd,-threaded-simd}.wasm（运行时只取其一） | 0.30 / 0.40 / 0.42 | 0.11 / 0.13 / 0.13 | 0.09 / 0.10 / 0.11 |
| | tf-backend-webgpu.min.js | 0.31 | 0.07 | 0.06 |
| ORT Web 1.30.0（CPU） | ort.wasm.min.mjs + ort-wasm-simd-threaded.{mjs,wasm} | 13.65 | 3.51 | 2.27 |
| ORT Web 1.30.0（WebGPU） | ort.webgpu.min.mjs + jsep.{mjs,wasm} | 27.11 | 6.35 | 3.80 |
| Transformers.js 4.3.1 | transformers.web.min.js（不含 ORT） | 0.43 | 0.12 | 0.10 |
| 模型 Xenova/distilbert-sst-2（q8） | model_quantized.onnx + tokenizer 等 | 65.13 | 46.44 | 44.31 |
| jax-js 0.1.27 | dist/*.js（ESM） | 0.64 | 0.17 | 0.14 |
| MNIST 子集（自制 uint8：784 字节像素 + 1 字节标签） | train 1000 / train 5000 / test 1000 | 0.75 / 3.74 / 0.75 | 0.15 / 0.77 / 0.15 | 0.13 / 0.65 / 0.13 |
| MNIST 完整原始 4 个 .gz | — | 11.06 | — | — |

说明：wheel、stdlib.zip 本身已压缩，服务器端再压缩基本没有收益。所以 Pyodide 轨道的瓶颈是 **wasm 本体加 numpy**。
另外，Transformers.js 4.3.1 依赖的是 **onnxruntime-web 1.31.0-dev**，不是 1.30.0。自托管时 ORT 的 wasm 版本必须和它匹配。

### 3.2 各轨道首次加载合计（冷缓存，brotli 传输量）

| 轨道 | 组成 | 原始 | brotli |
|---|---|---|---|
| A. WASI micrograd（现有 Python） | 纯 Python 代码 | ≈0 增量 | ≈0 增量 |
| **B. Pyodide + NumPy + MNIST 5k/1k** | 5.21 + 2.78 + 0.65 + 0.13 | 20.21 | **8.77** |
| B+. 再加 scikit-learn（可选） | B + 17.49 | 38.02 | 26.26 |
| C. TF.js（wasm 后端）+ MNIST 5k/1k | 0.28 + 0.03 + 0.11 + 0.78 | 6.45 | **≈1.20** |
| D. Transformers.js + ORT（CPU）+ sst-2 q8 | 0.10 + 2.27 + 44.31 | 79.21 | **≈46.7**（模型占 95%） |
| E. jax-js + MNIST | 0.14 + 0.78 | 5.13 | ≈0.92 |

### 3.3 运行耗时（本机）

同一份 NumPy MLP 代码（`measurements/mlp.py`）：XOR 用 2-16-2；螺旋数据集 300 点、2-100-3；MNIST 用 784-128-10，SGD，lr=0.1，bs=64，10 epoch，train 5000 / test 1000。

| 环境 | 加载 | XOR | 螺旋 | MNIST 5k×10ep | 准确率 |
|---|---|---|---|---|---|
| 原生 CPython 3.13 + NumPy（对照） | — | 0.07 s | 0.90 s | 0.97 s | 测试集 0.901 |
| Pyodide 314.0.7 / Node 20 | 运行时 1.6 s；numpy 0.39 s | 0.16 s | 1.92 s | 8.55 s | 0.901 |
| **Pyodide 314.0.7 / Chromium 156 Worker（COOP/COEP）** | 1.54 s；numpy 0.31 s | 0.18 s | 1.92 s | **8.62 s** | 0.901 |
| Pyodide + sklearn MLPClassifier(128) 10 iter / Node | sklearn+scipy 加载 3.4 s | — | — | 10.18 s | 0.911 |
| TF.js 4.22 cpu 后端 / Node | — | — | — | 28.29 s | 0.900 |
| TF.js 4.22 wasm 后端 / Node | 11 ms | — | — | 7.19 s | 0.885 |

纯 Python micrograd（`measurements/micrograd.py`，2-8-8-1 tanh，XOR，500 步）：

| 环境 | 训练耗时 | 结果 |
|---|---|---|
| 原生 CPython 3.13.5 | 1.43 s | loss 0.0041 |
| Pyodide（Node） | 1.78 s | 同上 |
| **WASI CPython 3.13.7（brettcannon 构建，wasmtime 49）** | 1.79 s（含启动共 2.7 s） | 同上；`import numpy` 报 ModuleNotFoundError |

推理（`measurements/ort_node.txt`）：

| 环境 | 加载 | 单句推理 |
|---|---|---|
| Transformers.js 4.3.1 / Node（走 onnxruntime-node，原生） | 303 ms | 2 句共 14 ms，结果正确（POSITIVE 0.9997 / NEGATIVE 0.9998） |
| onnxruntime-web 1.30.0 wasm / Node（单线程） | 会话 530 ms | 平均 24.4 ms |

浏览器内 ORT/TF.js 未测：Node 的 wasm 结果可作参考，但不等于浏览器多线程或 WebGPU 的表现。

**结论**：
- 在 Pyodide 上做 NumPy 训练，比原生慢约 2–9 倍（矩阵运算越重差距越大，因为没有原生 BLAS 和线程）。但 MNIST 5k 一次 10 epoch 仍在 10 秒内，适合教学。
- Pyodide 在浏览器 Worker 和 Node 里的表现几乎一致。

### 3.4 GitHub 活跃度（`measurements/github_stats.txt`，2026-10-20 抓取）

“90 天 commit”统计窗口从 2026-07-20 起，API 单页上限 100，所以 “100” 表示 ≥100。

| 项目 | Star | License(SPDX) | 最新 release（UTC 日期） | 90 天 commit |
|---|---|---|---|---|
| pyodide/pyodide | 14,898 | MPL-2.0 | 314.0.7（2026-09-14） | 76 |
| tensorflow/tfjs | 19,150 | Apache-2.0 | tfjs-v4.22.0（**2024-10-21**） | **0** |
| microsoft/onnxruntime | 22,119 | MIT | v1.31.0（2026-10-09） | ≥100 |
| huggingface/transformers.js | 16,355 | Apache-2.0 | 4.3.1（2026-10-07） | 16 |
| mlc-ai/web-llm | 19,284 | Apache-2.0 | v0.2.86（2026-10-11） | 19 |
| ngxson/wllama | 1,344 | MIT | 3.8.1（2026-10-02） | 18 |
| tracel-ai/burn | 16,131 | Apache-2.0（另有 MIT） | v0.22.0（2026-10-06） | ≥100 |
| huggingface/candle | 21,199 | Apache-2.0（另有 MIT） | 无 GitHub release | 66 |
| sonos/tract | 3,092 | NOASSERTION（MIT/Apache） | v0.23.9（2026-10-15） | ≥100 |
| tinygrad/tinygrad | 33,776 | MIT | v0.14.0（2026-08-24） | ≥100 |
| karpathy/micrograd | 17,970 | MIT | 无 | 1 |
| ekzhang/jax-js | 943 | MIT | npm 0.1.27（2026-10-18） | 未统计 |
| google-ai-edge/mediapipe | 37,333 | Apache-2.0 | v1.1.1（2026-10-14） | ≥100 |
| ml5js/ml5-next-gen | 187 | NOASSERTION（npm: MIT） | v1.4.0（2026-08-07） | 10 |
| BrainJS/brain.js | 14,858 | MIT | 1.4.10（2018）；npm 2.0.0-beta.24 | 0 |
| karpathy/convnetjs | 11,209 | MIT | 2014 | 0 |
| cazala/synaptic | 6,913 | NOASSERTION | 1.1.4（2017） | 1 |
| PaddlePaddle/Paddle.js | 1,106 | Apache-2.0 | v2.1.0（2021） | 0 |
| apache/tvm | 13,849 | Apache-2.0 | v0.27.0.post1（2026-09-29） | ≥100 |
| alibaba/MNN | 16,250 | Apache-2.0 | 3.6.1（2026-07-23） | ≥100 |
| Tencent/ncnn | 23,978 | NOASSERTION（BSD-3） | 20260526 | ≥100 |
| celsowm/torch-pyodide | 0 | 未声明 | v0.0.20 | 0 |
| taybenlor/runno | 775 | MIT | v0.10.2（2025-05-18） | 0 |
| brettcannon/cpython-wasi-build | 78 | MIT | v3.15.0（2026-10-09） | 6 |

## 4. NumPy on WASI 复核

- numpy/numpy#25859（WASI Build）仍为 **open**，最后更新 2024-02-21（GitHub API）。
- CPython 的 WASI 支持：PEP 11 / **PEP 816** 规定 3.13 起为 **Tier 2**，目标 WASI 0.1（3.13/3.14 用 WASI SDK 24，3.15 用 SDK 33）。WASI 0.2 已被跳过，直接奔 0.3。https://peps.python.org/pep-0011/ 、https://peps.python.org/pep-0816/
- **WASI 平台的 wheel 标签目前没有对应 PEP**。与之对照，Emscripten 的 **PEP 783 已接受**（https://peps.python.org/pep-0783/ ，https://discuss.python.org/t/pep-783-emscripten-packaging-is-accepted/107393 ）。
- 社区的 bkmashiro/wasi-wheels 只有 numpy 1.26.0b1，需要 componentize-py 静态打包，0 star，近 90 天无 commit。
- 实测：WASI CPython 3.13.7 执行 `import numpy` → ModuleNotFoundError。
- **结论不变，且更有把握**：要用 NumPy 就必须上 Pyodide；WASI 轨道只做纯 Python 内容。

## 5. Pyodide 与 COOP/COEP、Worker、stdin

- 实测（`measurements/browser_pyodide_worker.txt`，代码在 `measurements/web_test/`）：
  - 页面带 `COOP: same-origin`、`COEP: require-corp`、`CORP: same-origin`，`crossOriginIsolated=true`。
  - Worker 中 `loadPyodide({indexURL:'/pyodide/'})` 正常，所有文件自托管、不走 CDN。
  - `pyodide.setStdin({stdin})` 回调里用 `Atomics.wait` 阻塞在 SharedArrayBuffer 上，主线程写入后 `Atomics.notify`，Python 的 `input()` 拿到了 “7”，输出 42。`setStdout({batched})` 也能把输出转到主线程。
- 文档：Pyodide 的 Web Worker 用法 https://pyodide.org/en/stable/usage/webworker.html ；stdin/stdout 重定向 https://pyodide.org/en/stable/usage/streams.html （`setStdin`、`setStdout`）。
- 注意：自托管的 wheel 也要带 CORP 头，或与页面同源。

## 6. 方案再评估

### 6.1 新增和遗漏的候选

- **jax-js**（MIT，943 star，2025-12 发布，0.1.27）：纯 JS，零依赖，有 grad/jit/vmap，后端为 wasm（有 SAB 时多线程）、WebGPU、WebGL，官网有 MNIST 训练 demo；体积约 0.14 MB br。
  本机 Node 20 下因缺少 `navigator` 未跑通，**浏览器内未测**。API 是 JAX 风格，对新手不如 PyTorch 风格直观；项目也年轻，0.x 版本 API 可能变动。
- torch.js（npm `@torchjsorg/torch.js` 0.0.1）、tensorgrad（1 star）：太早期，不建议采用。
- tinygrad 的 `export_webgpu`：可用来“把训练好的模型导出到浏览器跑”，但不能让用户在浏览器里写 tinygrad。

### 6.2 自写 mini-torch，还是直接用现成库？

| 选项 | 许可证 | 优点 | 缺点 |
|---|---|---|---|
| micrograd（karpathy） | MIT | 经典、教学性强、WASI 能跑 | 只支持标量，跑不了 MNIST |
| autograd（HIPS） | MIT | 成熟，NumPy API 直接求导 | 不是 PyTorch 风格；已不在 Pyodide 内置包里，需 micropip/自托管 |
| tinygrad | MIT | PyTorch 风格、活跃 | Pyodide 内没有可用的加速后端（社区 demo 需要 JSPI flag），依赖重、改动快，**不推荐用于运行时** |
| **自写 `minitorch.py`（基于 NumPy 的 Tensor 自动微分）** | 自定 | API 可控（`Tensor/backward/nn.Linear/optim`），可作为题目的“标准答案库”，体积极小 | 需要维护，正确性要靠测试（可用数值梯度校验） |

建议：**自写一个几百行的 `minitorch.py`**，API 对齐 PyTorch 的子集；同时允许用户用 micropip 自行装 autograd。MIT 许可下可以借鉴 micrograd 的结构，保留其版权声明即可。

### 6.3 数据集与模型许可

- MNIST：**CC BY-SA 3.0**（https://keras.io/2/api/datasets/mnist/ ）。再分发子集需要署名，改编物也需按相同许可共享。也就是说，`.bin` 子集要单独标注许可，不能混进 MIT 代码的许可里。
- Fashion-MNIST：**MIT**（https://github.com/zalandoresearch/fashion-mnist/blob/master/LICENSE ）。许可更宽松，**建议默认数据集用 Fashion-MNIST**，MNIST 作为可选并注明许可。
- distilbert-base-uncased-finetuned-sst-2-english：原模型 HF 标签为 **apache-2.0**；Xenova 的 ONNX 转换版 API 未返回 license 字段（**未知**），按原模型许可处理，并在页面注明。
- 自制螺旋、XOR、回归数据：无许可问题。

## 7. 修订后的推荐

1. **Python 主线（置信度：高）**：Pyodide 314.x + NumPy 2.4.6 + 自写 `minitorch.py`。
   - 运行在 Web Worker，用 SAB 实现同步 stdin，输出接 xterm。
   - 首载 ≈ 8.8 MB br（含 MNIST 5k），之后走 Cache Storage；MNIST 5k 训练 10 epoch 约 8.6 s。
   - scikit-learn 不默认加载（+17.5 MB），只在对应题目里按需加载。
2. **零下载入门关（置信度：高）**：现有 WASI CPython 跑 micrograd 风格题目（标量 autograd、线性回归、XOR）。
3. **JS/TS 轨道（置信度：中）**：
   - 训练：短期用 **TF.js 4.22（wasm 后端）**，最轻（≈0.4 MB br），实测 7.2 s / 准确率 0.885。但上游 2 年无新版，同时用 jax-js 做浏览器 PoC 作为备选。
   - 推理：**Transformers.js 4.3.1 + 自托管 ORT（版本必须匹配）**。模型体积是主要成本（sst-2 q8 约 44 MB br），只作为可选关卡，并显示下载进度。
4. 不推荐：PyTorch/JAX 官方（无浏览器构建）、torch-pyodide、brain.js/ConvNetJS/Synaptic/Paddle.js（停更）、Rust/C++ 系（不适合“在浏览器写代码并运行”）、WebLLM（模型过大）。

## 8. 题目设想（不变，补充数据集建议）

线性回归 → micrograd `Value` → softmax/交叉熵的前向与反向 → MLP 拟合 XOR/螺旋 → Fashion-MNIST/MNIST 子集 MLP（准确率阈值约 0.85–0.90，依据本机实测）→ im2col 卷积 → SGD/Momentum/Adam 对比 → 注意力 → （JS）TF.js 训练 →（JS）ORT/Transformers.js 推理。
判题：隐藏的 `assert` 加数值容差；训练类题目要固定随机种子，并设超时上限（建议 ≥30 s，给慢设备留余量）。

## 9. 风险（更新）

- 低端或移动设备上，训练耗时可能是本机的数倍（**未测**）。
- Pyodide 主版本按 Python 版本走（314 → 315），wheel ABI 每年变一次；应锁定版本并整体自托管。
- 两个 Python 运行时并存：WASI Python 版本取决于 Runno 构建（当前版本**未核实**），与 Pyodide 3.14 可能有行为差异。
- TF.js 停滞；jax-js 年轻；Transformers.js 要求 ORT 版本精确匹配。
- 本报告的浏览器实测只覆盖 Chromium headless；Safari 和 Firefox **未测**。

## 10. 参考来源

- Pyodide releases API https://api.github.com/repos/pyodide/pyodide/releases ；npm https://www.npmjs.com/package/pyodide ；ABI https://pyodide.org/en/stable/development/abi.html
- PEP 783 https://peps.python.org/pep-0783/ ；PEP 816 https://peps.python.org/pep-0816/ ；PEP 11 https://peps.python.org/pep-0011/ ；numpy#25859 https://github.com/numpy/numpy/issues/25859 ；wasi-wheels https://github.com/bkmashiro/wasi-wheels
- ORT Web https://www.npmjs.com/package/onnxruntime-web ；TF.js https://github.com/tensorflow/tfjs/releases ；Transformers.js https://github.com/huggingface/transformers.js ；jax-js https://github.com/ekzhang/jax-js
- tinygrad https://github.com/tinygrad/tinygrad ；micrograd https://github.com/karpathy/micrograd ；autograd https://pypi.org/project/autograd/
- MNIST 许可 https://keras.io/2/api/datasets/mnist/ ；Fashion-MNIST https://github.com/zalandoresearch/fashion-mnist
- 模型 https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english ；https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english

## 11. 实现计划（本仓库按此落地）

调研里的 JS/TS 轨道、scikit-learn、Transformers.js 和「零下载 micrograd 关」这次不做。侧栏只加一行，运行时只加 Pyodide。

### 11.1 架构

- 语言 id 是 `numpy`，不是第二份 `python`。`compiler` 为 `pyodide`。`RunSession` 在这条分支上不创建 `WASIWorkerHost`。
- Worker 是 `src/pyodide/worker.ts`。它动态导入同源 `wasm/pyodide/pyodide.mjs`，`loadPyodide({ indexURL, packageBaseUrl })` 两个地址都是同源目录。`fetch` 被补丁成按文件名返回已下载的 wasm、zip、lock 和 wheel，所以 `loadPackage("numpy")` 不再访问网络。
- 标准输出和标准错误用 `setStdout` / `setStderr` 的 `batched` 回调送到 xterm。标准输入用一块 `SharedArrayBuffer`：偏移 0 的 `Int32` 是控制字（0 等待，正数是字节长度，-1 是 EOF），偏移 4 起是载荷，容量 65536。Worker 里 `Atomics.wait`，主线程 `Atomics.notify`。读出字节时先 `slice` 再交给 `TextDecoder`，因为它拒绝共享内存上的视图。页面原有的 COOP/COEP 和 `coi-serviceworker.js` 不变。
- `src/pyodide/minitorch.py` 随 Worker 以原始文本写入 `/opt/simplecode/minitorch.py`，执行前插入 `sys.path`。提供 `Tensor`（`backward` 只接受标量，另有索引、`exp`、`log`）、`nn.Linear`、`nn.ReLU`、`nn.Dropout`（掩码由调用方传入）、`nn.Sequential`、`train` / `eval`、`softmax`、`cross_entropy`、`accuracy`、`optim.SGD`（可带权重衰减）、`Momentum`、`AdaGrad`、`RMSProp`、`Adadelta`、`Adam`、`StepLR`，以及 `datasets.fashion_mnist`、`scale_batch`、`house_prices`、`airfoil`。
- Fashion-MNIST 子集写成 `/data/fashion-mnist.bin`。小端魔数 `0x314E4D46`，随后两个 uint32 是训练张数 32 和测试张数 8，然后是图像和标签。像素保持 uint8，按批再除以 255。归因在 `/data/FASHION.txt`。合成房价和机翼表写到 `/data/house-tiny.csv` 与 `/data/airfoil-tiny.csv`。
- 围栏语言 `numpy` 和 `np` 映射到这个运行时。写成 `python` 的围栏仍走 WASI CPython，文档里不用它来导入 NumPy。

### 11.2 界面

- 侧栏一行。短标签 `DL`。中英文都写 `DeepLearning`，和 Python、JavaScript 一样不随界面语言改名。展开时名称后面跟着灰色的 `Python (NumPy)`，避免和 WASI Python 搞混。
- 进度条仍是 `LanguageItem` 里的 `absolute inset-x-0 bottom-0 h-0.5`。资产进 `languages.config.mjs`，懒加载和 Cache API `simplecode-wasm-v1` 与其他 wasm 相同。
- 换语言时 `releaseRuntime` 调用 `cancelPyodide()`，停掉 Worker，终端按原有路径清屏再绑到新运行时。
- 快速入门默认打开 `dl`。抽屉里有 `docs-book-dl` 和 `docs-book-numpy` 两个按钮，切到 NumPy 那一本。`RUNTIME_BOOKS.numpy` 是 `["dl", "numpy"]`。

### 11.3 内容

- `docs/numpy/` 与 `docs/en/numpy/`：概览加 10 章（数组、dtype、下标、切片、广播、向量化、线性代数、随机数、形状、副本）。
- 扁平的 `docs/dl/*.md` 短课已在 [D2L_AND_LEETCODE_SCOPE.md](D2L_AND_LEETCODE_SCOPE.md) 阶段 2 删掉。目录改走 `chapter_*`，顺序见 `scripts/docs/dl-toc.ts`。阶段 2 只落地前言、安装、记号、引言四节只读正文。下面这一条是短课落地时的记录，不再表示抽屉里的章。
- `docs/dl/` 与 `docs/en/dl/`：概览加 10 章（线性回归、梯度下降、自动求导、XOR、螺旋、softmax / 交叉熵、Fashion-MNIST 子集、优化器、卷积一眼、注意力一眼）。
- 每章至少三个 `###`、两个带 `expect` 的 `numpy` 围栏。程序只用 ASCII，注释随中英文更换。训练示例的初值写死或用下标公式生成，不依赖 `np.random.seed`。Fashion 一章的 `expect` 只要求输出里出现 `acc`，避免把某一版 NumPy 的末位准确率写死。
- `docs/sources.yaml` 增加 `numpy-manual`（BSD-3-Clause，不改编原文）和 `fashion-mnist`（MIT）。

### 11.4 打包

- `./build.sh vendor --pyodide` 按 `scripts/sources.lock.json` 的 `pyodide` 下载并校验。上游 `pyodide.mjs` 里的 jsDelivr 默认地址会删掉，锁的是删过之后的 17883 字节。
- 阶段 3 把 Fashion-MNIST 换成训练 32 张、测试 8 张（31,412 字节），并加入合成房价表 `house-tiny.csv`（8,598 字节）和合成机翼表 `airfoil-tiny.csv`（1,956 字节）。九个文件都在 `wasm/pyodide/`，合计 **16,533,693** 字节。侧栏 `formatMB` 显示 **15.8 MB**。单文件都低于 GitHub 的 100 MB 限制。原先七个文件含 5000/1000 子集时是 21,201,739 字节、侧栏 20.2 MB。
- 这些文件登记为 `kind: "bin"` 资产，因此进入 `wasm/manifest.json`（仍不提交，由 `write-manifest.mjs` 生成），也进入 `vendor/prebuilt` 的 runtime 包。`./build.sh vendor` 失败时解开这份包，Vercel 继续走这条退路。`--pyodide` 自己失败时同样退回 runtime 包。
- 运行时不请求 CDN。锁文件和 `scripts/vendor-pyodide.mjs` 里可以保留构建期 URL。

### 11.5 测试

- `tests/minitorch.test.mjs` 在本机 CPython 上跑数值梯度。
- `tests/pyodide-no-remote.test.ts` 扫描 `src/`、`public/` 和已存在的 `wasm/pyodide` 文本，禁止 `cdn.jsdelivr.net`、`cdn.pyodide.org` 和 `d2l-data.s3-accelerate.amazonaws.com`。
- `tests/docs-ascii.test.ts`、`tests/docs-length.test.ts` 把 `numpy` 和 `dl` 算进去。20 章下限仍只约束原来的十三本。
- `tests/docs-smoke.mjs` 默认执行这两本书。
- `tests/numpy-ui.spec.mjs` 检查侧栏文案、按钮底边进度条、换语言清终端，以及中英抽屉切换。
- 合并前 `./build.sh build` 和 `./build.sh test` 都要通过。

### 11.6 阶段

1. 把调研原文放进 `plan/DEEP_LEARNING.md`，并写上本节。
2. 锁版本、vendor、Worker、侧栏和 `minitorch.py`。
3. 中英两本书、README 体积、许可证和预构建包。
4. 单测、文档冒烟、无远端检查、UI 检查，以及 Playwright 静态截图（侧栏进度、NumPy 教程、训练输出、英文界面）。截图放在构建产物目录，不放进 `docs/`。
