---
language: dl
chapter: 39
title: "A local window"
level: beginner
minutes: 8
goals:
  - "Dot four pixels with a kernel"
  - "See that the top-left result is 19"
  - "Compare with correlation over the whole image"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

A dense layer lets every output see every pixel. Convolution lets one output see a small patch. The top-left 2 by 2 window dotted with the kernel is 19.

### Only four numbers

The window is 0, 1, 3, 4 and the kernel is 0, 1, 2, 3. The dot product is 0 plus 1 plus 6 plus 12, which is 19. The other five pixels do not take part.

```numpy run expect="dot 19" title="Only four numbers"
# Four pixels at the top left
import numpy as np
window = np.array([[0.0, 1.0], [3.0, 4.0]])
kernel = np.array([[0.0, 1.0], [2.0, 3.0]])
print("dot", int((window * kernel).sum()))
```

### The same kernel scans the whole image

Conv2d lays every window into a row with im2col and multiplies once. It does not loop over pixels in Python. The top-left value is still 19 and the bottom-right value is 43.

```numpy run expect="19 43" title="The same kernel scans the whole image"
# The two corners
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 1, 1]))
```

### The weight repeats across windows

All four output positions use the same 2 by 2 kernel. A dense layer would need a different coefficient for each position, so it would hold many more parameters.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/why-conv.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/why-conv.html).
