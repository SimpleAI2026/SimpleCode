---
language: dl
chapter: 51
title: "残差块"
level: intermediate
minutes: 8
goals:
  - "把卷积支路和捷径相加"
  - "通道不同时用 1 乘 1 投影"
  - "两个块走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

残差块把两层 3 乘 3 的结果加上输入。通道或步幅变了的时候，捷径改成 1 乘 1 卷积。原 ResNet 有很多阶段。这里在 28 的图上只放两个块，通道从 8 到 16。

### 四步和一次检查

第二个块步幅是 2，边长从 28 收到 14，再平均汇聚到 7。拉直是 784，线性到 10。四步学习率 0.1。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Residual(mt.nn.Module):
    def __init__(self, cin, cout, stride=1):
        self.conv1 = mt.nn.Conv2d(cin, cout, 3, stride=stride, padding=1)
        self.conv2 = mt.nn.Conv2d(cout, cout, 3, padding=1)
        self.proj = None
        if stride != 1 or cin != cout:
            self.proj = mt.nn.Conv2d(cin, cout, 1, stride=stride)
    def forward(self, x):
        y = self.conv2(self.conv1(x).relu())
        skip = x if self.proj is None else self.proj(x)
        return (y + skip).relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    Residual(8, 8),
    Residual(8, 16, stride=2),
    mt.nn.AvgPool2d(2, stride=2),
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

零图经过同样的两个块。输出是四行十列，说明投影支路和主支路的形状能够相加。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
class Residual(mt.nn.Module):
    def __init__(self, cin, cout, stride=1):
        self.conv1 = mt.nn.Conv2d(cin, cout, 3, stride=stride, padding=1)
        self.conv2 = mt.nn.Conv2d(cout, cout, 3, padding=1)
        self.proj = None
        if stride != 1 or cin != cout:
            self.proj = mt.nn.Conv2d(cin, cout, 1, stride=stride)
    def forward(self, x):
        y = self.conv2(self.conv1(x).relu())
        skip = x if self.proj is None else self.proj(x)
        return (y + skip).relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    Residual(8, 8),
    Residual(8, 16, stride=2),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

两个残差块在八张检查图上印一次命中比例。捷径已经接上，这个比例仍不作为通过条件。

延伸阅读：[残差块](https://zh.d2l.ai/chapter_convolutional-modern/resnet.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/resnet.html)。
