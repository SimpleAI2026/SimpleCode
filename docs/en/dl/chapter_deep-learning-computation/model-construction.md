---
language: dl
chapter: 32
title: "Layers and blocks"
level: beginner
minutes: 8
goals:
  - "Put two layers into one block"
  - "Put that block into a network"
  - "Check the output row count"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

A block is itself a layer. The inner Sequential narrows the width from 4 to 2, and the outer layer narrows it to 1. A zero input checks the shape. No image file is read.

### Shape after nesting

Two rows of four zeros travel through the whole network and come out as two rows of one column. There are six parameter tensors: weight and bias for each of the three linear layers.

```numpy run expect="shape 2 1" title="Shape after nesting"
# The outer layer narrows to one column
import minitorch as mt
import numpy as np
np.random.seed(0)
inner = mt.nn.Sequential(mt.nn.Linear(4, 3), mt.nn.ReLU(), mt.nn.Linear(3, 2))
net = mt.nn.Sequential(inner, mt.nn.Linear(2, 1))
y = net(mt.tensor(np.zeros((2, 4))))
print("shape", y.shape[0], y.shape[1])
print("params", len(net.parameters()))
```

### Run the inner block alone

The same inner block, given two rows of ones, stops at width 2. A block can be called without the outer layer.

```numpy run expect="inner 2 2" title="Run the inner block alone"
# The inner width is 2
import minitorch as mt
import numpy as np
np.random.seed(0)
inner = mt.nn.Sequential(mt.nn.Linear(4, 3), mt.nn.ReLU(), mt.nn.Linear(3, 2))
z = inner(mt.tensor(np.ones((2, 4))))
print("inner", z.shape[0], z.shape[1])
```

### Call order

Sequential calls forward in the order used at construction. Swapping list positions swaps the calculation order.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/model-construction.html) and [en](https://d2l.ai/chapter_deep-learning-computation/model-construction.html).
