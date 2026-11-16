---
language: dl
chapter: 73
title: "注意力评分"
level: beginner
minutes: 8
goals:
  - "点积分数看方向是否一致"
  - "相加再过 tanh 看抵消"
  - "矩阵只有两维"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

评分函数把查询和键变成一个数。这一页比较两种：直接点积，以及相加之后再过 tanh。

### 点积

查询是 (1, 0)。它和自己的点积是 1，和垂直向量的点积是 0。

```numpy run expect="dot 1.0 0.0" title="点积"
# 两个键
import numpy as np
q = np.array([1.0, 0.0])
k = np.array([[1.0, 0.0], [0.0, 1.0]])
dots = k @ q
print("dot", round(float(dots[0]), 1), round(float(dots[1]), 1))
```

### 相加后再压缩

查询和键互为相反数时，相加是 0，tanh 之后再求和也是 0。这就是一种加性评分。

```numpy run expect="add 0.0" title="相加后再压缩"
# 相反的向量
import numpy as np
q = np.array([0.5, -0.5])
k = np.array([-0.5, 0.5])
score = float(np.tanh(q + k).sum())
print("add", round(score, 4))
```

### 分数还不是权重

评分这一页打印的是未归一化的数。除以宽度的平方根再做 softmax，留到多头那一页。

延伸阅读：[注意力评分](https://zh.d2l.ai/chapter_attention-mechanisms/attention-scoring-functions.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/attention-scoring-functions.html)。
