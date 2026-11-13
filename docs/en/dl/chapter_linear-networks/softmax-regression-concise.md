---
language: dl
chapter: 19
title: "Concise softmax"
level: beginner
minutes: 8
goals:
  - "Emit 10 scores from a linear layer"
  - "Update four times with SGD"
  - "Check the shape of four input rows"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The ten-way classifier becomes one linear layer with output size 10. The seed is fixed first. SGD then updates four times on four-image batches, and acc is printed on the eight check images.

### Layer and optimizer

Constructing the layer draws a small initial weight, so the seed is set before that call. The four-step loss and the one-shot acc are printed on two lines.

```numpy run expect="loss" title="Concise softmax"
# Output size is 10
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Linear(784, 10)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(xb), yb)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### Shape on four zero images

Four all-zero rows should come out as four rows and ten columns. This block does not read the image file. It only checks the shape.

```numpy run expect="shape 4 10" title="Output shape"
# Do not read the image file
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Linear(784, 10)
out = net(mt.tensor(np.zeros((4, 784))))
print("shape", out.shape[0], out.shape[1])
```

### The next step adds an activation

With only one linear layer, each score is a weighted sum of pixels. A multilayer perceptron inserts a rectifier in the middle, then a second linear layer brings the width back to 10.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/softmax-regression-concise.html) and [en](https://d2l.ai/chapter_linear-networks/softmax-regression-concise.html).
