---
language: dl
chapter: 29
title: "Shifted inputs"
level: intermediate
minutes: 8
goals:
  - "Train four steps on shifted inputs"
  - "Compare training loss and check loss"
  - "Print the gap of the two means"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Thirty-two training x values come from a standard normal. Eight check x values sit near mean 1.5. Both labels are 0.3x plus 0.1. Four steps update only on training slices, then one loss is computed on the eight check points.

### Four training steps and one check

Weight and bias start at 0 and the learning rate is 0.1. Each step uses four rows. The print shows the training loss and the check loss. The check loss may be larger because the inputs have moved.

```numpy run expect="loss" title="Four steps under shift"
# Check inputs sit near mean 1.5
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
train_x = rng.normal(0.0, 1.0, size=(32, 1))
train_y = 0.3 * train_x[:, 0] + 0.1
val_x = rng.normal(1.5, 1.0, size=(8, 1))
val_y = 0.3 * val_x[:, 0] + 0.1
w = mt.tensor(np.zeros(1), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for step in range(4):
    xb = train_x[step * 4:(step + 1) * 4]
    yb = train_y[step * 4:(step + 1) * 4]
    w.grad = None
    b.grad = None
    pred = mt.tensor(xb) @ w + b
    loss = ((pred - mt.tensor(yb)) * (pred - mt.tensor(yb))).mean()
    loss.backward()
    w.data -= 0.1 * w.grad
    b.data -= 0.1 * b.grad
    last = loss.item()
vpred = mt.tensor(val_x) @ w + b
vloss = ((vpred - mt.tensor(val_y)) * (vpred - mt.tensor(val_y))).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### The gap of means

The same pair of seeds is drawn again, and the block prints the check mean minus the training mean. The gap should sit near 1, with three decimals fixed by the seeds.

```numpy run expect="shift" title="Mean gap"
# Gap between two normal means
import numpy as np
rng = np.random.default_rng(0)
train_x = rng.normal(0.0, 1.0, size=32)
val_x = rng.normal(1.5, 1.0, size=8)
print("shift", round(float(val_x.mean() - train_x.mean()), 3))
```

### Real prices also change distribution

The next section's tiny table standardizes features on the training rows before applying them to the check rows. That is a different way to avoid a scale gap, not the random shift used here.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/environment.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/environment.html).
