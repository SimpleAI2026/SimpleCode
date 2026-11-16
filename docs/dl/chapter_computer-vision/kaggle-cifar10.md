---
language: dl
chapter: 111
title: "十分类的缩小替身"
level: intermediate
minutes: 8
goals:
  - "按目录名列出 20 个文件"
  - "实际标签只有四类"
  - "十六张训练图走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

比赛页按训练目录和检查目录把文件名排出来，每类一个文件夹。真正送进网络的是内存里的 16 张训练图和 4 张检查图，三通道，边长 32，标签被收成四类。不下载那个小压缩包。

### 四类上的四步

每步四张图，四步刚好用完 16 张训练图，不再重复。检查集四张只评估一次。准确率不作门槛。

```numpy run expect="loss" title="四类上的四步"
# 四类替身的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, vx, vy = mt.cifar_images()
net = mt.nn.Sequential(
    mt.nn.Conv2d(3, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(4 * 16 * 16, 4),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch_x = x[step * 4:(step + 1) * 4]
    batch_y = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(mt.tensor(batch_x.astype(np.float64) / 255.0)), batch_y)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(vx.astype(np.float64) / 255.0)), vy)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 目录名只是字符串

训练 16 个名字，检查 4 个名字，一共 20。第一个落在 train/c0，最后一个落在 val/c3。这些路径没有写到磁盘上。

```numpy run expect="files 20 train/c0/img0.bin val/c3/img3.bin" title="目录名只是字符串"
# 目录布局的名字
import minitorch as mt
import numpy as np
names = []
i = 0
while i < 16:
    names.append("train/c" + str(i % 4) + "/img" + str(i) + ".bin")
    i += 1
i = 0
while i < 4:
    names.append("val/c" + str(i % 4) + "/img" + str(i) + ".bin")
    i += 1
print("files", len(names), names[0], names[-1])
```

### 四类不是原比赛的十类

缩小替身把标签收成 0 到 3，通道仍是 3。它用来走通目录说明和四步训练，不提交比赛结果。

延伸阅读：[十分类的缩小替身](https://zh.d2l.ai/chapter_computer-vision/kaggle-cifar10.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/kaggle-cifar10.html)。
