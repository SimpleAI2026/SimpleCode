---
language: dl
chapter: 32
title: "层和块"
level: beginner
minutes: 8
goals:
  - "把两层装进一个块"
  - "再把块装进网络"
  - "核对输出行数"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

一个块自己也是层。内层 Sequential 先把宽度从 4 收到 2，外层再收到 1。零输入用来核对形状，不读取图片。

### 嵌套之后的形状

两行四列的零矩阵走完整个网络，得到两行一列。参数张量一共 6 个：三段线性层各自的权重和偏置。

```numpy run expect="shape 2 1" title="嵌套之后的形状"
# 外层再收一列
import minitorch as mt
import numpy as np
np.random.seed(0)
inner = mt.nn.Sequential(mt.nn.Linear(4, 3), mt.nn.ReLU(), mt.nn.Linear(3, 2))
net = mt.nn.Sequential(inner, mt.nn.Linear(2, 1))
y = net(mt.tensor(np.zeros((2, 4))))
print("shape", y.shape[0], y.shape[1])
print("params", len(net.parameters()))
```

### 只跑内层

同一个内层单独接受两行全 1 的输入，宽度停在 2。这说明块可以脱离外层单独调用。

```numpy run expect="inner 2 2" title="只跑内层"
# 内层宽度是 2
import minitorch as mt
import numpy as np
np.random.seed(0)
inner = mt.nn.Sequential(mt.nn.Linear(4, 3), mt.nn.ReLU(), mt.nn.Linear(3, 2))
z = inner(mt.tensor(np.ones((2, 4))))
print("inner", z.shape[0], z.shape[1])
```

### 调用顺序

Sequential 按构造时的顺序逐个调用 forward。调换列表里的位置就会调换计算顺序。

延伸阅读：[层和块](https://zh.d2l.ai/chapter_deep-learning-computation/model-construction.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/model-construction.html)。
