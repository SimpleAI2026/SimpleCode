---
language: dl
chapter: 18
title: "Softmax from scratch"
level: beginner
minutes: 8
goals:
  - "Take four steps with a hand-written weight"
  - "Print loss"
  - "Print acc on eight images"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The weight is a 10 by 784 zero matrix and the bias is zero. Each step takes four scaled images, four cross-entropy updates run, then acc is printed once on the eight check images.

### Four steps and one check

The learning rate is 0.1. The gradient is cleared immediately after each backward pass. The last two lines are loss and acc. Acc may be low. This section does not treat it as a gate.

```numpy run expect="loss" title="Scratch softmax"
# Four steps from a zero weight
import minitorch as mt
import numpy as np
x, y, xt, yt = mt.datasets.fashion_mnist()
w = mt.tensor(np.zeros((10, 784)), requires_grad=True)
b = mt.tensor(np.zeros(10), requires_grad=True)
last = 0.0
for step in range(4):
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    logits = xb @ w.T + b
    loss = mt.cross_entropy(logits, yb)
    loss.backward()
    w.data -= 0.1 * w.grad
    b.data -= 0.1 * b.grad
    w.grad = None
    b.grad = None
    last = loss.item()
vlogits = mt.tensor(mt.datasets.scale_batch(xt)) @ w.T + b
acc = mt.accuracy(vlogits, yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### How many labels

There are 32 training labels and 8 check labels. Four steps touch only the first 16 training labels. The check set is used once, as a whole.

```numpy run expect="labels 32 8" title="Label counts"
# 32 training labels
import minitorch as mt
x, y, xt, yt = mt.datasets.fashion_mnist()
print("labels", int(y.shape[0]), int(yt.shape[0]))
```

### The concise version switches to a ready layer

The hand-written product and a linear layer's forward are the same operation. The next section hands the weight to Linear and the update to SGD. The step count and the data stay the same.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/softmax-regression-scratch.html) and [en](https://d2l.ai/chapter_linear-networks/softmax-regression-scratch.html).
