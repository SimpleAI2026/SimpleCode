---
language: dl
chapter: 33
title: "参数管理"
level: beginner
minutes: 8
goals:
  - "让两层指向同一组权重"
  - "参数列表只出现一次"
  - "读出权重的行和列"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

把同一个线性层放进 Sequential 两次，前向会用它两次，参数列表里它只占一份。权重形状是 2 行 3 列。

### 共享之后只记一份

ReLU 没有参数。列表长度是 2，也就是这一份权重和这一份偏置。第二次调用会把梯度累加到同一块内存。

```numpy run expect="count 2" title="共享之后只记一份"
# 同一层出现两次
import minitorch as mt
import numpy as np
np.random.seed(0)
shared = mt.nn.Linear(3, 2)
net = mt.nn.Sequential(shared, mt.nn.ReLU(), shared)
print("count", len(net.parameters()))
```

### 直接读形状

不需要按名字搜索。层对象上的 weight 就是参数张量，行数是输出维，列数是输入维。

```numpy run expect="shape 2 3" title="直接读形状"
# 输出维在前
import minitorch as mt
import numpy as np
np.random.seed(0)
shared = mt.nn.Linear(3, 2)
print("shape", shared.weight.shape[0], shared.weight.shape[1])
```

### 梯度会加在一起

因为两次前向共用一个张量，反向时两段梯度写入同一处。更新也只做一次。

延伸阅读：[参数管理](https://zh.d2l.ai/chapter_deep-learning-computation/parameters.html)，英文页在[这里](https://d2l.ai/chapter_deep-learning-computation/parameters.html)。
