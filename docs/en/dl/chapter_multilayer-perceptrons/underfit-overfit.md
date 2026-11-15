---
language: dl
chapter: 24
title: "Underfit and overfit"
level: intermediate
minutes: 8
goals:
  - "Fit a curve with degree-1 features"
  - "Take four steps with features through degree 3"
  - "Print loss in both blocks"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Thirty-two x values come from a fixed seed. The target is a constant plus a linear term minus a square. Degree-1 features take four steps, then features through degree 3 take four steps. Each prints a loss.

### Four steps with degree-1 features

The features are a column of ones and a column of x. Weights start at 0 and the learning rate is 0.3. The squared loss at the fourth step is written as loss. There are only 32 samples and no extra holdout in this block.

```numpy run expect="loss" title="Degree-1 features"
# A line fit to a curved target
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = rng.random((32, 1)) * 2.0 - 1.0
target = 0.4 + 1.1 * x[:, 0] - 0.7 * (x[:, 0] ** 2)
feat = np.concatenate([np.ones((32, 1)), x], axis=1)
w = mt.tensor(np.zeros(feat.shape[1]), requires_grad=True)
last = 0.0
for _ in range(4):
    w.grad = None
    pred = mt.tensor(feat) @ w
    yt = mt.tensor(target)
    loss = ((pred - yt) * (pred - yt)).mean()
    loss.backward()
    w.data -= 0.3 * w.grad
    last = loss.item()
print("loss", round(last, 4))
```

### Add up through degree 3

The same x values gain a square column and a cube column. The learning rate of the four steps stays the same. The print has loss and the feature width 4. A wider feature is not required to show a smaller loss in four steps.

```numpy run expect="loss" title="Degree-3 features"
# Degree-3 features have width 4
import numpy as np
import minitorch as mt
rng = np.random.default_rng(0)
x = rng.random((32, 1)) * 2.0 - 1.0
col = x[:, 0]
target = 0.4 + 1.1 * col - 0.7 * (col ** 2)
feat = np.column_stack([np.ones(32), col, col ** 2, col ** 3])
w = mt.tensor(np.zeros(feat.shape[1]), requires_grad=True)
last = 0.0
for _ in range(4):
    w.grad = None
    pred = mt.tensor(feat) @ w
    yt = mt.tensor(target)
    loss = ((pred - yt) * (pred - yt)).mean()
    loss.backward()
    w.data -= 0.3 * w.grad
    last = loss.item()
print("loss", round(last, 4), "width", feat.shape[1])
```

### Four steps do not prove overfitting

Overfitting usually means the training loss falls while a held-out loss rises. Both blocks train for four steps only. The point is that both feature sets can take an update, not that one ends more accurate.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/underfit-overfit.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/underfit-overfit.html).
