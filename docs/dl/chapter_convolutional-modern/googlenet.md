---
language: dl
chapter: 49
title: "并行分支"
level: intermediate
minutes: 8
goals:
  - "四条分支拼在通道维"
  - "只放一个缩小的 Inception"
  - "四步打印 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

Inception 同时走 1 乘 1、3 乘 3、5 乘 5 和一条汇聚后再 1 乘 1，然后在通道维拼接。原 GoogLeNet 把这种模块叠很多层，并使用 224 的图。这里在 14 乘 14 上只放一个模块，每条分支 4 个通道。

### 四步和一次检查

拼接之后是 16 个通道。再汇聚一次得到 7 乘 7，拉直成 784，线性到 10。四步的批量仍是 4。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Inception(mt.nn.Module):
    def __init__(self, cin):
        self.b1 = mt.nn.Conv2d(cin, 4, 1)
        self.b2 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 3, padding=1))
        self.b3 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 5, padding=2))
        self.pool = mt.nn.MaxPool2d(3, stride=1, padding=1)
        self.b4 = mt.nn.Conv2d(cin, 4, 1)
    def forward(self, x):
        y = mt.cat([self.b1(x), self.b2(x), self.b3(x), self.b4(self.pool(x))], axis=1)
        return y.relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Inception(8),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]).reshape(4, 1, 28, 28)
    loss = mt.cross_entropy(net(mt.tensor(xb)), y[step * 4:(step + 1) * 4])
    loss.backward()
    opt.step()
    last = loss.item()
net.eval()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt).reshape(8, 1, 28, 28))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### 零图上的输出形状

四条分支的填充把空间尺寸留在同一边长上，否则 cat 会对不齐。零图上的最终形状是四行十列。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
class Inception(mt.nn.Module):
    def __init__(self, cin):
        self.b1 = mt.nn.Conv2d(cin, 4, 1)
        self.b2 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 3, padding=1))
        self.b3 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 5, padding=2))
        self.pool = mt.nn.MaxPool2d(3, stride=1, padding=1)
        self.b4 = mt.nn.Conv2d(cin, 4, 1)
    def forward(self, x):
        y = mt.cat([self.b1(x), self.b2(x), self.b3(x), self.b4(self.pool(x))], axis=1)
        return y.relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Inception(8),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

单个 Inception 也会在八张检查图上印出命中比例。四条分支并在一起之后，这个比例可以仍然很低。

延伸阅读：[并行分支](https://zh.d2l.ai/chapter_convolutional-modern/googlenet.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/googlenet.html)。
