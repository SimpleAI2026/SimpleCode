---
language: dl
chapter: 41
title: "Padding and stride"
level: beginner
minutes: 8
goals:
  - "Keep the edge at 8 after padding 1"
  - "Reach 2 by 2 with another stride"
  - "Remember the output-edge formula"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

The output edge is the input edge plus padding on both sides, minus the kernel edge, divided by the stride, then plus 1. The blocks below use a zero tensor to check shapes. Random weights do not change the edge.

### Padding keeps the edge

An 8 by 8 input, a 3 by 3 kernel, and a ring of zeros. The numerator is 8 plus 2 minus 3 and the stride is 1, so the output stays 8 by 8.

```numpy run expect="shape 8 8" title="Padding keeps the edge"
# One ring of padding
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Conv2d(1, 1, 3, padding=1)
y = layer(mt.tensor(np.zeros((1, 1, 8, 8))))
print("shape", y.shape[2], y.shape[3])
```

### Stride cuts the edge down

The kernel is 3 by 5, the padding is (0, 1), and the stride is (3, 4). The height becomes 2 and the width becomes 2.

```numpy run expect="shape 2 2" title="Stride cuts the edge down"
# Height and width are written apart
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Conv2d(1, 1, (3, 5), padding=(0, 1), stride=(3, 4))
y = layer(mt.tensor(np.zeros((1, 1, 8, 8))))
print("shape", y.shape[2], y.shape[3])
```

### The pad value is 0

Padded cells are 0 and they do enter the product inside a window. Max pooling pads with a very small number so it does not invent a maximum. That belongs to the pooling section.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html).
