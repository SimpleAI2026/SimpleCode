---
language: dl
chapter: 43
title: "Pooling"
level: beginner
minutes: 8
goals:
  - "Max pooling yields 5, 7, 13, and 15"
  - "Average pooling yields four half-integers"
  - "Know that pooling has no trainable weight"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Arrange 0 through 15 as 4 by 4 and use a 2 by 2 window with stride 2. Max pooling takes the largest number in the window. Average pooling takes the mean. Neither layer has a weight.

### The maximum in each window

The top-left window max is 5, the top-right is 7, the bottom-left is 13, and the bottom-right is 15. The gradient returns only to that maximum position.

```numpy run expect="5 7 13 15" title="The maximum in each window"
# 2 by 2 maximum
import minitorch as mt
import numpy as np
grid = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4))
y = mt.nn.MaxPool2d(2, stride=2)(grid)
print(int(y.data[0, 0, 0, 0]), int(y.data[0, 0, 0, 1]), int(y.data[0, 0, 1, 0]), int(y.data[0, 0, 1, 1]))
```

### The average in each window

The averages of those same windows are 2.5, 4.5, 10.5, and 12.5. The gradient is split evenly across the four cells of a window.

```numpy run expect="2.5 4.5 10.5 12.5" title="The average in each window"
# 2 by 2 average
import minitorch as mt
import numpy as np
grid = mt.tensor(np.arange(16, dtype=np.float64).reshape(1, 1, 4, 4))
y = mt.nn.AvgPool2d(2, stride=2)(grid)
print(y.data[0, 0, 0, 0], y.data[0, 0, 0, 1], y.data[0, 0, 1, 0], y.data[0, 0, 1, 1])
```

### Pooling only shrinks space

The channel count stays the same. LeNet uses average pooling to take 28 down to 14 and then to 5. Modern networks more often use max pooling.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/pooling.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/pooling.html).
