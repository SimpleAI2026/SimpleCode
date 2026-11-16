---
language: dl
chapter: 34
title: "构造时就有参数"
level: intermediate
minutes: 8
goals:
  - "看到权重在 forward 之前就存在"
  - "核对 2 行 5 列"
  - "说明这里没有惰性分配"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

有的框架在第一次 forward 才根据输入决定权重形状。这里的线性层在构造函数里就把形状定死，forward 之前就能读到 weight。

### 构造完就能读

Linear(5, 2) 的权重是 2 行 5 列。这一段没有调用 forward。修改点就在这里：做不到等到第一次前向再分配。

```numpy run expect="ready 2 5" title="构造完就能读"
# 构造时已经分配
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(5, 2)
print("ready", layer.weight.shape[0], layer.weight.shape[1])
```

### 前向不改变形状

三行五列的零输入得到三行两列。行数跟着批量走，列数仍是构造时写的 2。

```numpy run expect="out 3 2" title="前向不改变形状"
# 列数保持为 2
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(5, 2)
y = layer(mt.tensor(np.zeros((3, 5))))
print("out", y.shape[0], y.shape[1])
```

### 输入维必须事先知道

构造时就要写出输入维。不能先建一个空层，再靠一张图的宽度把矩阵补出来。

延伸阅读：[构造时就有参数](https://zh.d2l.ai/chapter_deep-learning-computation/deferred-init.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/deferred-init.html)。
