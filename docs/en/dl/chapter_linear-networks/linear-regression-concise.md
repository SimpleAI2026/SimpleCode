---
language: dl
chapter: 15
title: "Concise linear regression"
level: beginner
minutes: 8
goals:
  - "Fit a line with a linear layer"
  - "Update four times with SGD"
  - "Check the shape of a one-row input"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The same synthetic line now uses a linear layer and stochastic gradient descent. The layer draws its weight at construction, so the block fixes the random seed first. After four steps it scores eight new points once.

### A linear layer and four steps

Input size and output size are both 1. Each optimizer step subtracts the learning rate times the stored gradient. Training loss and validation loss share one line.

```numpy run expect="loss" title="Concise steps"
# Build the layer after the seed
import numpy as np
import minitorch as mt
np.random.seed(0)
rng = np.random.default_rng(0)
x = mt.tensor(rng.random((32, 1)))
y = mt.tensor(1.0 + 2.0 * x.data)
net = mt.nn.Linear(1, 1)
opt = mt.optim.SGD(net.parameters(), lr=0.2)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    pred = net(x)
    loss = ((pred - y) * (pred - y)).mean()
    loss.backward()
    opt.step()
    last = loss.item()
rng2 = np.random.default_rng(2)
xv = mt.tensor(rng2.random((8, 1)))
yv = mt.tensor(1.0 + 2.0 * xv.data)
vloss = ((net(xv) - yv) * (net(xv) - yv)).mean()
print("loss", round(last, 4), round(vloss.item(), 4))
```

### Shape of a one-row input

Sending a single 0.5 through the same kind of linear layer yields one row and one column. This block does not update parameters. It only checks the shape, separate from the four-step run.

```numpy run expect="shape 1 1" title="Output shape"
# The output is one by one
import minitorch as mt
import numpy as np
np.random.seed(1)
layer = mt.nn.Linear(1, 1)
out = layer(mt.tensor([[0.5]]))
print("shape", out.shape[0], out.shape[1])
```

### Image classification changes the output size to 10

A line emits one number. The clothing-image layer maps 784 pixels to 10 scores. The layer type is the one from this section. Only the width changes.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/linear-regression-concise.html) and [en](https://d2l.ai/chapter_linear-networks/linear-regression-concise.html).
