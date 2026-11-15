---
language: dl
chapter: 48
title: "1 乘 1 卷积"
level: intermediate
minutes: 8
goals:
  - "每个块里放两次 1 乘 1"
  - "最后用整幅平均汇聚代替大线性层"
  - "输出直接是 10 类"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

NiN 块是一次普通卷积再接两次 1 乘 1。1 乘 1 在每个像素上混合通道。原网络通道更宽。这里三块的通道是 8、16、10，最后对 7 乘 7 做平均汇聚，得到每类一个数。

### 四步和一次检查

因为最后已经是 10 个通道的 1 乘 1 图，拉直之后就是 10 维，不再接一个大的全连接。四步学习率 0.1。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
def nin_block(cin, cout, k, stride, pad):
    return mt.nn.Sequential(
        mt.nn.Conv2d(cin, cout, k, stride=stride, padding=pad), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
    )
net = mt.nn.Sequential(
    nin_block(1, 8, 5, 1, 2),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(8, 16, 3, 1, 1),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(16, 10, 3, 1, 1),
    mt.nn.AvgPool2d(7),
    mt.nn.Flatten(),
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

四张零图的输出形状是 4 行 10 列。这列数来自最后一块的通道数，不是来自一个 400 维的线性层。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
def nin_block(cin, cout, k, stride, pad):
    return mt.nn.Sequential(
        mt.nn.Conv2d(cin, cout, k, stride=stride, padding=pad), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
    )
net = mt.nn.Sequential(
    nin_block(1, 8, 5, 1, 2),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(8, 16, 3, 1, 1),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(16, 10, 3, 1, 1),
    mt.nn.AvgPool2d(7),
    mt.nn.Flatten(),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

NiN 的第二行是八张检查图里预测对的比例。最后已经是十个通道，这个比例仍然只供阅读。

延伸阅读：[1 乘 1 卷积](https://zh.d2l.ai/chapter_convolutional-modern/nin.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/nin.html)。
