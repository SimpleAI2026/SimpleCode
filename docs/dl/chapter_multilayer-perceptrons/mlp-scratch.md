---
language: dl
chapter: 22
title: "感知机从零实现"
level: intermediate
minutes: 8
goals:
  - "分开写隐藏层和输出层"
  - "在 32 张图上走四步"
  - "打印 loss 和 acc"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

隐藏层和输出层分开写。输入是四张缩放后的服装图，隐藏宽度 32，输出 10 类。四步 SGD 之后对八张检查图打印 acc。

### 两层和四步

隐藏层的输出先整流，再送进第二个线性层。学习率 0.2。loss 和 acc 分两行，acc 不作门槛。

```numpy run expect="loss" title="手写感知机"
# 隐藏宽度 32
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
hidden = mt.nn.Linear(784, 32)
out = mt.nn.Linear(32, 10)
opt = mt.optim.SGD(hidden.parameters() + out.parameters(), lr=0.2)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(out(hidden(xb).relu()), yb)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(out(hidden(mt.tensor(mt.datasets.scale_batch(xt))).relu()), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### 宽度写在打印里

另一段不读取图片，只把隐藏宽度、类别数和步数印出来，方便和上一段的循环对照。

```numpy run expect="hidden 32 classes 10 steps 4" title="宽度"
# 对照宽度和步数
print("hidden", 32, "classes", 10, "steps", 4)
```

### 序列容器在下一节

手写调用的顺序是隐藏、整流、输出。简洁实现把这三步放进 Sequential，优化器一次拿到全部参数。

延伸阅读：[感知机从零实现](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp-scratch.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/mlp-scratch.html)。
