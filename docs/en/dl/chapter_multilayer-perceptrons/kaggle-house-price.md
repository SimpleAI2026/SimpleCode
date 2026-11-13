---
language: dl
chapter: 30
title: "Predicting prices"
level: intermediate
minutes: 8
goals:
  - "Read 16 plus 8 rows"
  - "Standardize from the training rows"
  - "Print both losses after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The table has 24 rows: 16 for training and 8 for checking, with price in the last column. The numbers are generated for this page, not copied from a contest spreadsheet. Features are standardized on the training rows, and a linear model takes four steps.

### Four steps after standardizing

Each column subtracts the training mean and divides by the training standard deviation. The learning rate is 0.05 and each step uses four rows. The print shows the training loss and the loss on the eight check rows.

```numpy run expect="loss" title="Price steps"
# 16 training rows and 8 check rows
import numpy as np
import minitorch as mt
x, y, xt, yt = mt.datasets.house_prices()
mu = x.mean(axis=0)
sd = np.where(x.std(axis=0) < 1e-8, 1.0, x.std(axis=0))
def norm(a):
    return (a - mu) / sd
w = mt.tensor(np.zeros(x.shape[1]), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for step in range(4):
    xb = norm(x[step * 4:(step + 1) * 4])
    yb = y[step * 4:(step + 1) * 4]
    w.grad = None
    b.grad = None
    pred = mt.tensor(xb) @ w + b
    loss = ((pred - mt.tensor(yb)) * (pred - mt.tensor(yb))).mean()
    loss.backward()
    w.data -= 0.05 * w.grad
    b.data -= 0.05 * b.grad
    last = loss.item()
vpred = mt.tensor(norm(xt)) @ w + b
vloss = ((vpred - mt.tensor(yt)) * (vpred - mt.tensor(yt))).mean()
print("loss", round(last, 4), round(float(vloss.item()), 4))
```

### Row counts and column count

Training has 16 rows, checking has 8, and the feature columns exclude the price. The column count should be 36. This block does not update a weight.

```numpy run expect="rows 16 8 36" title="Price shape"
# Price is not a feature
import minitorch as mt
x, y, xt, yt = mt.datasets.house_prices()
print("rows", x.shape[0], xt.shape[0], x.shape[1])
```

### Do not download the contest spreadsheet

The original spreadsheet is about nine tenths of a megabyte, and redistribution was not cleared here. The file stays a synthetic table of about eight kilobytes, and the section remains a reduced one.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html).
