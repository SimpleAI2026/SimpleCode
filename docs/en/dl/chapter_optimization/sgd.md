---
language: dl
chapter: 82
title: "Stochastic gradient descent"
level: intermediate
minutes: 8
goals:
  - "Use one sample per step"
  - "Update four times"
  - "Separate that loss from a full-data average"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Thirty-two points have labels equal to 0.5 times x. Each step takes one index, updates the slope from that point's squared loss, and stops after four steps.

### One point at a time

The seed is 0, the slope starts at 0, and the learning rate is 0.1. The loss of the single point on the fourth step is printed as loss. It is not the average over all thirty-two points.

```numpy run expect="loss" title="One-sample steps"
# One index per step
import numpy as np
rng = np.random.default_rng(0)
x = rng.normal(0.0, 1.0, size=32)
y = 0.5 * x
w = 0.0
last = 0.0
for step in range(4):
    i = step
    pred = w * x[i]
    loss = (pred - y[i]) ** 2
    grad = 2.0 * (pred - y[i]) * x[i]
    w -= 0.1 * grad
    last = loss
print("loss", round(last, 4))
```

### Step count and sample count

The print states one sample per step and four steps in total. Batches larger than 1 wait for the airfoil section.

```numpy run expect="sample 1 steps 4" title="Sample count"
# The batch size is 1
print("sample", 1, "steps", 4)
```

### A minibatch takes four rows

The next section uses four airfoil rows at a time. The gradient is the average of those four rows, not the single row used here.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/sgd.html) and [en](https://d2l.ai/chapter_optimization/sgd.html).
