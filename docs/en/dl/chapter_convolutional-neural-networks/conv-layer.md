---
language: dl
chapter: 40
title: "Cross-correlation"
level: beginner
minutes: 8
goals:
  - "Compute the four integers of a 2 by 2 result"
  - "Repeat it on a batch of two images"
  - "Confirm the bottom-right value is still 43"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

The input is 0 through 8 arranged as 3 by 3. The kernel is [[0, 1], [2, 3]] and the bias is 0. The four cross-correlation cells are 19, 25, 37, and 43.

### Four integer cells

Each cell is the sum of products of the current window and the kernel. Moving the kernel one column to the right sees larger pixels, so the right-hand cells are larger.

```numpy run expect="19 25 37 43" title="Four integer cells"
# The four hand-computed cells
import minitorch as mt
image = mt.tensor([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(image, weight, bias)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### Stack two copies in the batch

Two identical images are stacked on the batch axis. The bottom-right cell of the second image is still 43, and the first dimension of the shape is 2.

```numpy run expect="batch 2 43" title="Stack two copies in the batch"
# Two identical images
import minitorch as mt
import numpy as np
image = np.array([[[[0.0, 1.0, 2.0], [3.0, 4.0, 5.0], [6.0, 7.0, 8.0]]]])
pair = np.concatenate([image, image], axis=0)
weight = mt.tensor([[[[0.0, 1.0], [2.0, 3.0]]]])
bias = mt.tensor([0.0])
y = mt.conv2d(mt.tensor(pair), weight, bias)
print("batch", y.shape[0], int(y.data[1, 0, 1, 1]))
```

### The implementation is not a Python loop over pixels

im2col first arranges windows into a matrix, then multiplies by the flattened kernel. The backward pass sends the gradient back into overlapping windows.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/conv-layer.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/conv-layer.html).
