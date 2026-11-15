---
language: dl
chapter: 34
title: "Parameters exist at construction"
level: intermediate
minutes: 8
goals:
  - "See the weight before any forward"
  - "Check 2 rows and 5 columns"
  - "State that allocation is not lazy"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Some frameworks decide the weight shape on the first forward. A linear layer here fixes the shape inside the constructor, so weight can be read before any forward.

### Readable right after construction

The weight of Linear(5, 2) is 2 by 5. This block never calls forward. That is the change from the usual lazy story: allocation does not wait for the first forward.

```numpy run expect="ready 2 5" title="Readable right after construction"
# Allocated at construction
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(5, 2)
print("ready", layer.weight.shape[0], layer.weight.shape[1])
```

### Forward does not change the shape

Three rows of five zeros produce three rows of two columns. The row count follows the batch. The column count stays at the 2 written during construction.

```numpy run expect="out 3 2" title="Forward does not change the shape"
# The column count stays 2
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.Linear(5, 2)
y = layer(mt.tensor(np.zeros((3, 5))))
print("out", y.shape[0], y.shape[1])
```

### The input width must be known up front

The input width is an argument of the constructor. An empty layer cannot be created first and then filled from the width of an image.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/deferred-init.html) and [en](https://d2l.ai/chapter_deep-learning-computation/deferred-init.html).
