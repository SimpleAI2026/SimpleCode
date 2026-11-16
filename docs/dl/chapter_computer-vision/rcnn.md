---
language: dl
chapter: 106
title: "区域池化"
level: intermediate
minutes: 8
goals:
  - "在 16 乘 16 的特征上切框"
  - "池化成 2 乘 2"
  - "四步更新头和特征"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

区域网络这一页没有选择性搜索，也没有主干权重。特征是 1 乘 4 乘 16 乘 16 的随机图。四只框各池化成 2 乘 2，再送进线性层。

### 池化之后走四步

框的五个数是批下标、左、上、右、下，坐标落在特征图的像素上。四步的批量就是这四只框。特征和线性层一起更新。

```numpy run expect="loss" title="池化之后走四步"
# 区域池化后的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
feat = mt.tensor(np.random.randn(1, 4, 16, 16), requires_grad=True)
head = mt.nn.Linear(4 * 2 * 2, 2)
opt = mt.optim.SGD([feat] + head.parameters(), lr=0.1)
boxes = np.array([[0, 1, 1, 9, 9], [0, 4, 4, 14, 12], [0, 0, 2, 8, 10], [0, 6, 1, 15, 8]], dtype=np.float64)
labels = np.array([0, 1, 0, 1])
last = 0.0
for step in range(4):
    opt.zero_grad()
    pooled = mt.roi_pool(feat, boxes, 2).reshape(4, -1)
    loss = mt.cross_entropy(head(pooled), labels)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 输出格子是 2

一只框池化之后是 1 乘 4 乘 2 乘 2。通道仍是特征的通道数。空白特征上池化结果是 0。

```numpy run expect="roi 1 4 2 0" title="输出格子是 2"
# 一只框的池化形状
import minitorch as mt
import numpy as np
feat = mt.tensor(np.zeros((1, 4, 16, 16)))
boxes = np.array([[0, 1, 1, 9, 9]], dtype=np.float64)
pooled = mt.roi_pool(feat, boxes, 2)
print("roi", pooled.shape[0], pooled.shape[1], pooled.shape[2], int(pooled.data.reshape(-1)[0]))
```

### 不搜索候选区域

区域池化页的四只框是写死的。没有在像素上跑提案算法，也没有把分类网络的权重载进来。

延伸阅读：[区域池化](https://zh.d2l.ai/chapter_computer-vision/rcnn.html)，英文页在[这里](https://d2l.ai/chapter_computer-vision/rcnn.html)。
