---
language: dl
chapter: 112
title: "两种犬的缩小替身"
level: intermediate
minutes: 8
goals:
  - "列出十个按品种分夹的名字"
  - "八张训练图两种标签"
  - "两批交替走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

犬种页同样先排目录名：训练夹和检查夹下面各有两个品种夹。送进网络的是八张训练图和两张检查图，三通道，边长 32，只有两种标签。不下载那个品种包。

### 两批轮流

八张图分成两批，每批四张。四步里这两批各用两次。平均池化把边长收到 16。检查两张只跑一次。

```numpy run expect="loss" title="两批轮流"
# 两种标签的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.dog_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(3, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 2),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    loss = mt.cross_entropy(
        net(mt.tensor(x[start:start + 4].astype(np.float64) / 255.0)),
        y[start:start + 4],
    )
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 品种夹的名字

训练八个名字、检查两个，一共十个。第一个在 train/b0，最后一个在 val/b1。字符串不落盘。

```numpy run expect="files 10 train/b0/img0.bin val/b1/img1.bin" title="品种夹的名字"
# 两种品种的目录名
import minitorch as mt
import numpy as np
names = []
i = 0
while i < 8:
    names.append("train/b" + str(i % 2) + "/img" + str(i) + ".bin")
    i += 1
i = 0
while i < 2:
    names.append("val/b" + str(i % 2) + "/img" + str(i) + ".bin")
    i += 1
print("files", len(names), names[0], names[-1])
```

### 两种不是完整品种表

缩小的犬种页只留标签 0 和 1，用来说明按夹存放再训练四步。它不识别那一百多种犬，也不读取外部权重。

延伸阅读：[两种犬的缩小替身](https://zh.d2l.ai/chapter_computer-vision/kaggle-dog.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/kaggle-dog.html)。
