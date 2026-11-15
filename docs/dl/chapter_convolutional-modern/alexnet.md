---
language: dl
chapter: 46
title: "缩小的 AlexNet"
level: intermediate
minutes: 8
goals:
  - "保留卷积、汇聚、暂退和线性层"
  - "通道改成 8、16、12"
  - "四步之后打印 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

原结构把图放到 224，第一层核是 11、步幅 4，通道从 96 起。28 的边上那样做，第二次汇聚会得到空的特征图。这里核改成 5 和 3，通道是 8、16、12，两个宽线性层改成 24。

### 四步和一次检查

暂退层用固定种子自己抽掩码，所以四步可以重复。评估前调用 eval，暂退会把输入原样送出。学习率 0.1。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 5, padding=2), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(8, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 12, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(108, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=1),
    mt.nn.Linear(24, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=2),
    mt.nn.Linear(24, 10),
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

三次步幅为 2 的汇聚把 28 收到 14、7、3。最后一层卷积是 12 个通道，拉直后是 108，再收到 10 类。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 5, padding=2), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(8, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 12, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(108, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=1),
    mt.nn.Linear(24, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=2),
    mt.nn.Linear(24, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

缩小后的 AlexNet 把八张检查图的命中比例印在第二行。通道只有 8 到 12 时，四步之内这个比例接近零也很正常。

延伸阅读：[缩小的 AlexNet](https://zh.d2l.ai/chapter_convolutional-modern/alexnet.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/alexnet.html)。
