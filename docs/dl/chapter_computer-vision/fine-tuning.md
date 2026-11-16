---
language: dl
chapter: 100
title: "微调"
level: intermediate
minutes: 8
goals:
  - "用八张合成灰图"
  - "冻住第一层卷积"
  - "四步之后看一次检查集"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

微调这一页没有现成的大模型权重。八张 32 乘 32 的灰图分成四张训练、四张检查，两类标签。第一层卷积保持随机并冻住，只更新后面的线性层。

### 同一批重复四次

训练只有四张图，所以四步都喂这同一批。学习率 0.05。检查集的准确率没有意义，打印出来只是看评估走了一遍。

```numpy run expect="loss" title="同一批重复四次"
# 冻住第一层再走四步
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.finetune_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 2),
)
net.layers[0].weight.requires_grad = False
net.layers[0].bias.requires_grad = False
opt = mt.optim.SGD(net.parameters(), lr=0.05)
xb = mt.tensor(x.astype(np.float64) / 255.0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    loss = mt.cross_entropy(net(xb), y)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 池化之后的宽度

边长 32 经过步长 2 的池化变成 16。四个通道铺平后，线性层收到 1024 个数，打出两个分数。

```numpy run expect="shape 4 1024" title="池化之后的宽度"
# 四张空白图的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
blank = mt.tensor(np.zeros((4, 1, 32, 32)))
tower = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
)
flat = tower(blank)
print("shape", flat.shape[0], flat.shape[1])
```

### 冻住的层不进更新

把卷积的权重和偏置标成不需要梯度之后，优化器的参数表里就没有它们。这不是从图像网上接着训，只是一个随机特征提取器配一个小头。

延伸阅读：[微调](https://zh.d2l.ai/chapter_computer-vision/fine-tuning.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/fine-tuning.html)。
