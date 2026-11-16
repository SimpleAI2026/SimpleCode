---
language: dl
chapter: 108
title: "Transposed convolution"
level: intermediate
minutes: 8
goals:
  - "Check a kernel of all ones"
  - "Read the edge at stride 2"
  - "Also read one bilinear resize"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Transposed convolution paints each input pixel onto the output with a kernel. The weight shape here is input channels, output channels, kernel height, kernel width. That channel order differs from an ordinary convolution.

### The center of an all-ones kernel is 4

The input is a 2 by 2 block of ones, and the kernel is a 2 by 2 block of ones, with stride 1. The output edge is 3. A corner is 1 and the center is 4, because four inputs each add once at the center.

```numpy run expect="out 3 1 4" title="The center of an all-ones kernel is 4"
# output of an all-ones kernel
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.ones((1, 1, 2, 2)))
layer = mt.nn.ConvTranspose2d(1, 1, 2, stride=1, padding=0, bias=False)
layer.weight.data[:] = 1
y = layer(x)
print("out", y.shape[2], int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 1, 1]))
```

### Stride 2 and bilinear

The same 2 by 2 input with kernel 2 and stride 2 has output edge 4. Beside that, the values 0, 1, 2, and 3 form a 2 by 2 map, bilinear resize takes it to 4 by 4, and the inner point (1, 1) is 0.75.

```numpy run expect="stride 4 4 0.75" title="Stride 2 and bilinear"
# stride and bilinear
import minitorch as mt
import numpy as np
x = mt.tensor(np.ones((1, 1, 2, 2)))
layer = mt.nn.ConvTranspose2d(1, 1, 2, stride=2, bias=False)
wide = layer(x)
small = mt.tensor(np.arange(4, dtype=np.float64).reshape(1, 1, 2, 2))
up = mt.upsample_bilinear(small, (4, 4))
print("stride", wide.shape[2], wide.shape[3], round(float(up.data[0, 0, 1, 1]), 2))
```

### The channel order is part of the weight

The first dimension of a transposed-convolution weight is the input channel. Filling that kernel as if the output channel came first, the way an ordinary convolution does, sends the paint to the wrong channel.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/transposed-conv.html) and [en](https://d2l.ai/chapter_computer-vision/transposed-conv.html).
