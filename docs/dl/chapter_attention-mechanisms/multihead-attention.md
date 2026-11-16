---
language: dl
chapter: 75
title: "多头注意力"
level: beginner
minutes: 8
goals:
  - "把宽度拆成两个头"
  - "缩放点积后再拼回去"
  - "输出形状回到 2 乘 4 乘 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

多头先把查询、键、值投影到同一宽度，再按头切开。每个头做缩放点积，拼回去之后再过一次线性层。

### 输出形状不变

输入是 2 乘 4 乘 8，两个头各看 4 维。拼完并投影之后，形状仍是 2 乘 4 乘 8。

```numpy run expect="shape 2 4 8" title="输出形状不变"
# 两个头
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.MultiHeadAttention(8, 2)
y = layer(mt.tensor(np.zeros((2, 4, 8))), mt.tensor(np.zeros((2, 4, 8))), mt.tensor(np.zeros((2, 4, 8))))
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 一行权重加起来是 1

缩放点积后面的 softmax 让每个查询对所有键的权重和为 1。

```numpy run expect="row 1.0" title="一行权重加起来是 1"
# softmax
import minitorch as mt
import numpy as np
q = mt.tensor(np.ones((1, 2, 4)))
_ctx, weights = mt.dot_attention(q, q, q)
print("row", round(float(weights.data[0, 0].sum()), 4))
```

### 头数在这一页写明

多头注意力使用 2 个头，模型宽度 8。它不读取文本，形状核对完就结束。

延伸阅读：[多头注意力](https://zh.d2l.ai/chapter_attention-mechanisms/multihead-attention.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/multihead-attention.html)。
