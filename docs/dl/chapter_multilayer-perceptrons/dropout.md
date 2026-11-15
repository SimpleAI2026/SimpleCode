---
language: dl
chapter: 26
title: "暂退法"
level: intermediate
minutes: 8
goals:
  - "用给定掩码做暂退"
  - "训练时放大保留单元"
  - "评估时原样返回输入"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

掩码由块内的发生器产生，种子固定，打印才不会每次变。训练状态下保留的位置乘上 1 除以 0.5。评估状态下输入原样返回。

### 训练时用掩码

四个位置里，掩码为 1 的会被放大两倍。打印保留个数，以及输出元素之和。和应等于保留个数乘 2。

```numpy run expect="kept" title="训练掩码"
# 种子 0 的掩码
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
mask = (rng.random((1, 4)) >= 0.5).astype(np.float64)
layer = mt.nn.Dropout(0.5)
layer.train()
out = layer(mt.tensor([[1.0, 1.0, 1.0, 1.0]]), mask)
print("kept", int(mask.sum()), "sum", round(float(out.sum().item()), 1))
```

### 评估时忽略掩码

关掉训练标记之后，就算传入一张全零掩码，1、2、3 的和仍是 6。评估不把单元丢掉。

```numpy run expect="eval 6.0" title="评估模式"
# 全零掩码也不应改变和
import numpy as np
import minitorch as mt
layer = mt.nn.Dropout(0.5)
layer.eval()
out = layer(mt.tensor([[1.0, 2.0, 3.0]]), np.zeros((1, 3)))
print("eval", round(float(out.sum().item()), 1))
```

### 掩码不要用全局随机流

如果掩码来自会跨运行留下来的全局流，期望字符串会对不上。所以掩码写在块里，发生器带种子。

延伸阅读：[暂退法](https://zh.d2l.ai/chapter_multilayer-perceptrons/dropout.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/dropout.html)。
