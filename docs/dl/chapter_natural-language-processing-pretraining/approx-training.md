---
language: dl
chapter: 115
title: "负采样的两个分数"
level: intermediate
minutes: 8
goals:
  - "正样本一个分数"
  - "负样本一个分数"
  - "都过 sigmoid"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

近似训练把整张词表的归一化换成一个正样本加少量负样本。这一页只有一个正分数 1.2 和一个负分数 -0.4，先看 sigmoid，不更新参数。

### 两个 sigmoid

正分数 1.2 的 sigmoid 约是 0.7685。负分数 -0.4 约是 0.4013。负样本个数记成 1。

```numpy run expect="neg 1 0.7685 0.4013" title="两个 sigmoid"
# 正负两个 sigmoid
import minitorch as mt
import numpy as np
score = np.array([1.2, -0.4])
sig = 1.0 / (1.0 + np.exp(-score))
print("neg", 1, round(float(sig[0]), 4), round(float(sig[1]), 4))
```

### 标签是 1 和 0

正样本的目标是 1，负样本的目标是 0。二元交叉熵用的就是这对标签。这里只把标签打印出来。

```numpy run expect="labels 1 0" title="标签是 1 和 0"
# 正负标签
import minitorch as mt
import numpy as np
print("labels", 1, 0)
```

### 整表 softmax 不在这页

负采样这页不给十二个词各打一个分数。它只说明一个正样本和一个负样本怎样变成两个 sigmoid。

延伸阅读：[负采样的两个分数](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/approx-training.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/approx-training.html)。
