---
language: dl
chapter: 42
title: "Several channels"
level: beginner
minutes: 8
goals:
  - "Add two input channels"
  - "Obtain 56, 72, 104, and 120"
  - "Then see the shape of two output channels"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Each input channel is correlated on its own, then the cells are added. The first channel below is 0 through 8, the second is 1 through 9, and the kernels are [[0, 1], [2, 3]] and [[1, 2], [3, 4]].

### Add two channels

Alone, the first channel produces 19, 25, 37, 43. The second produces 37, 47, 67, 77. Added, they are 56, 72, 104, 120.

```numpy run expect="56 72 104 120" title="Add two channels"
# Two input channels
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]], [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]], [[1.0, 2.0], [3.0, 4.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### Two output channels

Stack a copy of the kernel, plus 1, on the output axis. The output channel count is 2, and the top-left cell of channel 0 is still 56.

```numpy run expect="shape 2 56" title="Two output channels"
# Two output channels
import minitorch as mt
import numpy as np
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]], [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]]])
base = np.array([[[[0.0, 1.0], [2.0, 3.0]], [[1.0, 2.0], [3.0, 4.0]]]])
weight = mt.tensor(np.concatenate([base, base + 1.0], axis=0))
bias = mt.tensor([0.0, 0.0])
y = mt.conv2d(image, weight, bias)
print("shape", y.shape[1], int(y.data[0, 0, 0, 0]))
```

### A 1 by 1 kernel only mixes channels

When the kernel height and width are both 1, each spatial position is a linear mix of channels and the spatial size stays put. NiN uses that layer later.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/channels.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/channels.html).
