---
language: dl
chapter: 41
title: "填充和步幅"
level: beginner
minutes: 8
goals:
  - "填充 1 后边长仍是 8"
  - "另一种步幅得到 2 乘 2"
  - "记住输出边长的式子"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

输出边长是 (输入边长 + 两侧填充 - 核边长) 整除步幅，再加 1。下面只用零张量核对形状，权重随机不影响边长。

### 填充把边长留住

8 乘 8 的输入，3 乘 3 的核，四周补一圈 0。分子是 8+2-3，步幅是 1，输出仍是 8 乘 8。

```numpy run expect="shape 8 8" title="填充把边长留住"
# 四周补一圈
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Conv2d(1, 1, 3, padding=1)
y = layer(mt.tensor(np.zeros((1, 1, 8, 8))))
print("shape", y.shape[2], y.shape[3])
```

### 步幅把边长砍小

核是 3 乘 5，填充是 (0, 1)，步幅是 (3, 4)。高变成 2，宽也变成 2。

```numpy run expect="shape 2 2" title="步幅把边长砍小"
# 高和宽分开写
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Conv2d(1, 1, (3, 5), padding=(0, 1), stride=(3, 4))
y = layer(mt.tensor(np.zeros((1, 1, 8, 8))))
print("shape", y.shape[2], y.shape[3])
```

### 填充值是 0

补上去的格子是 0，会计入窗口里的乘积。汇聚层的最大值填充则用更小的数，避免假的最大值，那是下一节的事。

延伸阅读：[填充和步幅](https://zh.d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html)。
