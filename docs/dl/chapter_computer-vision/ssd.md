---
language: dl
chapter: 105
title: "单发检测头"
level: intermediate
minutes: 8
goals:
  - "保留类别卷积和框卷积"
  - "输入边长收成 32"
  - "四步只打印损失"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这里的检测头不是完整的多尺度检测器。主干一层卷积加池化，边长从 32 收到 16。类别卷积打出 2 个通道，框卷积打出 4 个通道。训练八张图，四步里每批四张，两批轮流用。

### 类别损失加框的平方差

每个格子的类别目标几乎都是背景，只有 (4, 4) 标成 1。框的目标是全零，损失用平方差。打印的是两项之和。

```numpy run expect="loss" title="类别损失加框的平方差"
# 缩短后的检测头
import minitorch as mt
import numpy as np
np.random.seed(0)
images, _boxes, _labels, _vi, _vb, _vl = mt.detect_images()
body = mt.nn.Sequential(
    mt.nn.Conv2d(1, 4, 3, padding=1),
    mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
)
cls = mt.nn.Conv2d(4, 2, 1)
box = mt.nn.Conv2d(4, 4, 1)
params = body.parameters() + cls.parameters() + box.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    batch = images[start:start + 4]
    feat = body(mt.tensor(batch.astype(np.float64) / 255.0))
    scores = cls(feat).reshape(4 * 16 * 16, 2)
    pred = box(feat)
    target = np.zeros((4, 16, 16), dtype=np.int64)
    target[:, 4, 4] = 1
    loss_c = mt.cross_entropy(scores, target.reshape(-1))
    diff = pred - mt.tensor(np.zeros_like(pred.data))
    loss_b = (diff * diff).mean()
    loss = loss_c + loss_b
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 两个头的通道

在 8 边长的特征上，类别头的通道是 2，框头的通道是 4，空间边长仍是 8。这一小段不反传。

```numpy run expect="heads 2 4 8" title="两个头的通道"
# 头的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
feat = mt.tensor(np.zeros((1, 4, 8, 8)))
cls = mt.nn.Conv2d(4, 2, 1)
box = mt.nn.Conv2d(4, 4, 1)
print("heads", cls(feat).shape[1], box(feat).shape[1], cls(feat).shape[2])
```

### 匹配被简化了

单发检测这一页不按交并比给锚分配目标，也不堆多层特征。类别图上只有一个格子是正类，用来把四步跑通。

延伸阅读：[单发检测头](https://zh.d2l.ai/chapter_computer-vision/ssd.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/ssd.html)。
