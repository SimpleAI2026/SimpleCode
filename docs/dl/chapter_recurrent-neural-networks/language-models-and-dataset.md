---
language: dl
chapter: 56
title: "语言模型和数据集"
level: beginner
minutes: 8
goals:
  - "切出 32 条训练窗口"
  - "留出 8 条检查窗口"
  - "批量是 4 乘 4"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

语言模型要预测下一个词。这一页先把词编成编号，再切成固定长度的窗口，不更新任何权重。

### 三十二加八

每个窗口是 5 个编号：前 4 个当输入，后移一位当目标。前 32 条给训练，接着 8 条给检查。

```numpy run expect="train 32" title="三十二加八"
# 窗口长度是 5
import minitorch as mt
import numpy as np
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
print("train", len(windows[:32]))
print("val", len(windows[32:40]))
```

### 一个批量的形状

从训练窗口里拿前 4 条，丢掉最后一个编号，就得到 4 乘 4 的输入。

```numpy run expect="batch 4 4" title="一个批量的形状"
# 四条窗口
import minitorch as mt
import numpy as np
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
batch = np.stack([row[:-1] for row in windows[:4]])
print("batch", batch.shape[0], batch.shape[1])
```

### 这一页不更新权重

数据集页只核对 32 条训练窗口和 4 乘 4 的批量。权重留到从零实现和简洁实现那两页。

延伸阅读：[语言模型和数据集](https://zh.d2l.ai/chapter_recurrent-neural-networks/language-models-and-dataset.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/language-models-and-dataset.html)。
