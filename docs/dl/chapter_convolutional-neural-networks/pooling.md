---
language: dl
chapter: 43
title: "汇聚"
level: beginner
minutes: 8
goals:
  - "最大汇聚得到 5、7、13、15"
  - "平均汇聚得到四个半数"
  - "知道汇聚没有可训练权重"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

把 0 到 15 排成 4 乘 4，用 2 乘 2、步幅 2 的窗口。最大汇聚取窗口里最大的数，平均汇聚取平均数。两种层都没有权重。

### 每个窗口的最大值

左上窗口最大是 5，右上是 7，左下是 13，右下是 15。梯度只回到那个最大的位置。

```numpy run expect="5 7 13 15" title="每个窗口的最大值"
# 2 乘 2 的最大
import minitorch as mt
import numpy as np
grid = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4))
y = mt.nn.MaxPool2d(2, stride=2)(grid)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### 每个窗口的平均

同一组窗口的平均数是 2.5、4.5、10.5、12.5。梯度平均分给窗口里的四个格子。

```numpy run expect="2.5 4.5 10.5 12.5" title="每个窗口的平均"
# 2 乘 2 的平均
import minitorch as mt
import numpy as np
grid = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4))
y = mt.nn.AvgPool2d(2, stride=2)(grid)
print(y.data[0, 0, 0, 0], y.data[0, 0, 0, 1], y.data[0, 0, 1, 0], y.data[0, 0, 1, 1])
```

### 汇聚只缩小空间

通道数不变。LeNet 用平均汇聚把 28 收到 14 再收到 5，现代网络里更常见的是最大汇聚。

延伸阅读：[汇聚](https://zh.d2l.ai/chapter_convolutional-neural-networks/pooling.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/pooling.html)。
