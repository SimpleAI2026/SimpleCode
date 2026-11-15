---
language: dl
chapter: 47
title: "VGG 块"
level: intermediate
minutes: 8
goals:
  - "每个块是若干 3 乘 3 卷积再汇聚"
  - "只用三块，通道 8 和 16"
  - "在 28 的边上走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

VGG 块是重复的 3 乘 3 卷积，后面接一次步幅 2 的最大汇聚。原网络块更多、通道到 512，并且吃 224 的图。这里只有三块，通道是 8 和 16，输入边长是 28。

### 四步和一次检查

三块之后空间边长是 3，16 个通道拉直成 144，再线性到 10。四步的批量是 4，检查图有 8 张。

```numpy run expect="loss" title="四步和一次检查"
# 四步，一批四张
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
def vgg_block(cin, cout, convs):
    layers = []
    for i in range(convs):
        layers.append(mt.nn.Conv2d(cin if i == 0 else cout, cout, 3, padding=1))
        layers.append(mt.nn.ReLU())
    layers.append(mt.nn.MaxPool2d(2, stride=2))
    return mt.nn.Sequential(*layers)
net = mt.nn.Sequential(
    vgg_block(1, 8, 1),
    vgg_block(8, 16, 1),
    vgg_block(16, 16, 2),
    mt.nn.Flatten(),
    mt.nn.Linear(144, 10),
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

零输入不读文件。输出仍应是四行十列，说明最后的线性层接收了 144 维。

```numpy run expect="shape 4 10" title="零图上的输出形状"
# 四张全零的图
import minitorch as mt
import numpy as np
np.random.seed(1)
def vgg_block(cin, cout, convs):
    layers = []
    for i in range(convs):
        layers.append(mt.nn.Conv2d(cin if i == 0 else cout, cout, 3, padding=1))
        layers.append(mt.nn.ReLU())
    layers.append(mt.nn.MaxPool2d(2, stride=2))
    return mt.nn.Sequential(*layers)
net = mt.nn.Sequential(
    vgg_block(1, 8, 1),
    vgg_block(8, 16, 1),
    vgg_block(16, 16, 2),
    mt.nn.Flatten(),
    mt.nn.Linear(144, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### acc 不是门槛

三块 VGG 也会把八张检查图的命中比例印出来。块数少、通道停在 16，这个比例不必升高。

延伸阅读：[VGG 块](https://zh.d2l.ai/chapter_convolutional-modern/vgg.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/vgg.html)。
