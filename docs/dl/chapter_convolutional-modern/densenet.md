---
language: dl
chapter: 52
title: "稠密连接"
level: intermediate
minutes: 8
goals:
  - "把新特征接到旧通道后面"
  - "增长率是 4"
  - "两层之后走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

稠密层用 3 乘 3 卷积产生 growth 个新通道，再和输入在通道维拼接。原 DenseNet 会接很多层。这里先汇聚到 14，再叠两层，增长率是 4，通道从 8 长到 16。

### 四步和一次检查

第二次汇聚得到 7 乘 7。16 个通道拉直成 784，再线性到 10。批量 4，四步，检查图 8 张。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Dense(mt.nn.Module):
    def __init__(self, cin, growth):
        self.conv = mt.nn.Conv2d(cin, growth, 3, padding=1)
    def forward(self, x):
        y = self.conv(x).relu()
        return mt.cat([x, y], axis=1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Dense(8, 4),
    Dense(12, 4),
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

拼接要求除了通道以外的维度一致。3 乘 3 带填充 1，所以边长不变，cat 可以接上。零图输出是四行十列。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
class Dense(mt.nn.Module):
    def __init__(self, cin, growth):
        self.conv = mt.nn.Conv2d(cin, growth, 3, padding=1)
    def forward(self, x):
        y = self.conv(x).relu()
        return mt.cat([x, y], axis=1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Dense(8, 4),
    Dense(12, 4),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

增长率 4 的两层也会在八张检查图上印命中比例。新通道接在旧通道后面，这个比例只是读数。

延伸阅读：[稠密连接](https://zh.d2l.ai/chapter_convolutional-modern/densenet.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/densenet.html)。
