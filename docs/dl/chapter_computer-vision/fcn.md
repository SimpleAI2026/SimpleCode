---
language: dl
chapter: 109
title: "全卷积"
level: intermediate
minutes: 8
goals:
  - "下采样再转置卷积回去"
  - "对每个像素做两类"
  - "四步重复同一批"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

全卷积这一页用分割样本的四张图。池化把边长收到 16，转置卷积按步长 2 放回 32，1 乘 1 卷积打出每个像素的两个分数。四步都用这同一批。

### 像素上的交叉熵

输出先把通道挪到最后一维，再铺成两列。标签图按同样的顺序铺平。打印的损失是全部像素的平均。

```numpy run expect="loss" title="像素上的交叉熵"
# 四张图上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
images, masks = mt.segment_images()
down = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
)
up = mt.nn.ConvTranspose2d(4, 4, 2, stride=2)
head = mt.nn.Conv2d(4, 2, 1)
opt = mt.optim.SGD(down.parameters() + up.parameters() + head.parameters(), lr=0.1)
xb = mt.tensor(images.astype(np.float64) / 255.0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    y = head(up(down(xb)))
    logits = y.permute(0, 2, 3, 1).reshape(-1, 2)
    loss = mt.cross_entropy(logits, masks.reshape(-1))
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 边长回到 32

空白的 32 边长图池化后是 16。核为 2、步长为 2 的转置卷积把它送回 32。通道在这个形状检查里保持 1。

```numpy run expect="back 16 32" title="边长回到 32"
# 下去再上来
import minitorch as mt
import numpy as np
np.random.seed(0)
blank = mt.tensor(np.zeros((1, 1, 32, 32)))
down = mt.nn.MaxPool2d(2, stride=2)(blank)
up = mt.nn.ConvTranspose2d(1, 1, 2, stride=2)(down)
print("back", down.shape[2], up.shape[2])
```

### 不是逐像素的查表

全卷积页的分数来自卷积和转置卷积，不是给每个像素单独做一次全连接。四步之后也不看分割图长什么样。

延伸阅读：[全卷积](https://zh.d2l.ai/chapter_computer-vision/fcn.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/fcn.html)。
