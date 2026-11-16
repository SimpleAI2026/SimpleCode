---
language: dl
chapter: 76
title: "自注意力和位置编码"
level: beginner
minutes: 8
goals:
  - "查询、键、值来自同一条序列"
  - "位置用正弦和余弦"
  - "序列长度是 4"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

自注意力让一条序列自己当查询、键和值。正弦位置编码加在表示上，第 0 位的前两个数是 0 和 1。

### 第 0 位的前两个数

偶数维是正弦，奇数维是余弦。位置 0 的正弦是 0，余弦是 1。

```numpy run expect="pe01 1.0" title="第 0 位的前两个数"
# 正弦和余弦
import minitorch as mt
pe = mt.positional_encoding(4, 8)
print("pe00", round(float(pe[0, 0]), 4))
print("pe01", round(float(pe[0, 1]), 4))
```

### 自己注意自己

同一条长度 4、宽度 8 的序列同时充当查询、键和值。输出形状保持不变。

```numpy run expect="shape 1 4 8" title="自己注意自己"
# 三条输入相同
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((1, 4, 8)))
y = mt.nn.MultiHeadAttention(8, 2)(x, x, x)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 位置不是学出来的

位置编码是常数，不进入参数列表。自注意力这一页到 pe01 等于 1 和形状 1 乘 4 乘 8 为止。

延伸阅读：[自注意力和位置编码](https://zh.d2l.ai/chapter_attention-mechanisms/self-attention-and-positional-encoding.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/self-attention-and-positional-encoding.html)。
