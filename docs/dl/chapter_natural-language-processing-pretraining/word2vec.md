---
language: dl
chapter: 114
title: "一个窗口"
level: intermediate
minutes: 8
goals:
  - "用中心词对左右邻居"
  - "把点积写成一个数"
  - "先不更新向量"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

窗口这一页只用三个手写向量，不读语料。中心词在中间，左右各一个邻居。点积大，表示两个方向更接近。

### 中心对左边

中心是 (1, 0)，左边是 (0.6, 0.8)。点积是 0.6。窗口半径记成 1。

```numpy run expect="window 1 0.6" title="中心对左边"
# 中心和左边
import minitorch as mt
import numpy as np
center = np.array([1.0, 0.0])
left = np.array([0.6, 0.8])
print("window", 1, round(float(center.dot(left)), 1))
```

### 右边的点积是 0

右边是 (0, 1)，和中心垂直，点积是 0。邻居个数是 2。这一页不抽样负词。

```numpy run expect="sides 2 0.0" title="右边的点积是 0"
# 中心和右边
import minitorch as mt
import numpy as np
center = np.array([1.0, 0.0])
right = np.array([0.0, 1.0])
print("sides", 2, round(float(center.dot(right)), 1))
```

### 窗口先不进语料

一个窗口这页的三个向量是写死的，用来看点积。真正的短句和负样本在后面的预训练页。

延伸阅读：[一个窗口](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word2vec.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/word2vec.html)。
