---
language: dl
chapter: 33
title: "Parameter access"
level: beginner
minutes: 8
goals:
  - "Point two layers at one weight"
  - "See that parameter list once"
  - "Read the weight rows and columns"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

Placing the same linear layer into a Sequential twice uses it twice in the forward pass, while the parameter list stores it once. The weight has 2 rows and 3 columns.

### Sharing stores one copy

ReLU has no parameters. The list length is 2: that one weight and that one bias. A second call adds its gradient into the same memory.

```numpy run expect="count 2" title="Sharing stores one copy"
# The same layer appears twice
import minitorch as mt
import numpy as np
np.random.seed(0)
shared = mt.nn.Linear(3, 2)
net = mt.nn.Sequential(shared, mt.nn.ReLU(), shared)
print("count", len(net.parameters()))
```

### Read the shape directly

No name search is required. The weight attribute is the parameter tensor. Rows are the output width and columns are the input width.

```numpy run expect="shape 2 3" title="Read the shape directly"
# The output width comes first
import minitorch as mt
import numpy as np
np.random.seed(0)
shared = mt.nn.Linear(3, 2)
print("shape", shared.weight.shape[0], shared.weight.shape[1])
```

### Gradients add together

Because both forwards share one tensor, backprop writes both pieces of gradient into that same place. The update still happens once.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/parameters.html) and [en](https://d2l.ai/chapter_deep-learning-computation/parameters.html).
