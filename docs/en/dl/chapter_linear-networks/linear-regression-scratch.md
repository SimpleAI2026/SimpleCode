---
language: dl
chapter: 14
title: "Linear regression from scratch"
level: beginner
minutes: 8
goals:
  - "Write a squared loss from scratch"
  - "Apply four hand updates"
  - "Score eight new points once"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Weight and bias start at 0. Thirty-two synthetic points still come from y = 1 + 2x. Each step uses every point in one squared loss, four times, then one loss is computed on eight fresh points.

### Evaluate after four steps

The learning rate is 0.5. Each of the four steps clears the gradient before the backward pass so gradients do not pile up. The last line prints the training loss and the loss on eight new points.

```numpy run expect="loss" title="Hand-written steps"
# Four steps on a synthetic line
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = mt.tensor(rng.random((32, 1)))
y = mt.tensor(1.0 + 2.0 * x.data)
w = mt.tensor(np.zeros((1, 1)), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for _ in range(4):
    pred = x @ w.T + b
    loss = ((pred - y) * (pred - y)).mean()
    loss.backward()
    w.data -= 0.5 * w.grad
    b.data -= 0.5 * b.grad
    w.grad = None
    b.grad = None
    last = loss.item()
rng2 = np.random.default_rng(1)
xv = mt.tensor(rng2.random((8, 1)))
yv = mt.tensor(1.0 + 2.0 * xv.data)
vpred = xv @ w.T + b
vloss = ((vpred - yv) * (vpred - yv)).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### The batch size is the shape

The real loop uses all 32 points, which is already the small size of this example. A second block only prints the batch mark 4 and the step count, as a reminder that the image sections switch to four rows at a time.

```numpy run expect="batch 4 steps 4" title="Batch mark"
# Mark the batch and the step count
import numpy as np
x = np.linspace(0.0, 1.0, 4).reshape(4, 1)
print("batch", x.shape[0], "steps", 4)
```

### Do not chase many decimals of the slope

Four steps only show that a gradient can change the weights. Recovering 2 and 1 to many decimals is not required. The output needs a loss.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/linear-regression-scratch.html) and [en](https://d2l.ai/chapter_linear-networks/linear-regression-scratch.html).
