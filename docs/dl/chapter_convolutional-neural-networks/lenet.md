---
language: dl
chapter: 44
title: "LeNet"
level: beginner
minutes: 8
goals:
  - "按两层卷积和三层线性来搭"
  - "在 32 张图上走四步"
  - "核对输出是 4 行 10 列"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

第一层卷积核是 5、填充 2，所以 28 的边长先保持不变，平均汇聚之后是 14。第二层卷积核是 5、没有填充，得到 10，再汇聚成 5。拉直后是 400，接着 120、84、10。激活是 sigmoid。

### 四步和一次检查

学习率 0.1。每步取四张已经缩放到 0 和 1 之间的图，排成 NCHW。八张检查图只在四步之后评估一次。

```numpy run expect="loss" title="四步和一次检查"
# 两层卷积的 LeNet
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(400, 120), mt.nn.Sigmoid(),
    mt.nn.Linear(120, 84), mt.nn.Sigmoid(),
    mt.nn.Linear(84, 10),
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

### 四张零图的形状

不读取图片文件。四张全零的 28 乘 28 图经过网络后应是四行十列，对应十个类别的分数。

```numpy run expect="shape 4 10" title="四张零图的形状"
# 不读取图片文件
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(400, 120), mt.nn.Sigmoid(),
    mt.nn.Linear(120, 84), mt.nn.Sigmoid(),
    mt.nn.Linear(84, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### 结构没有把图放大

输入边长保持 28。填充只出现在第一层，用来让第一次汇聚之前仍是 28，而不是把图拉到更大的正方形。

延伸阅读：[LeNet](https://zh.d2l.ai/chapter_convolutional-neural-networks/lenet.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/lenet.html)。
