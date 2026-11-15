---
language: dl
chapter: 50
title: "Batch normalization"
level: intermediate
minutes: 8
goals:
  - "See values near plus and minus 1 on a 2 by 2"
  - "Insert the layer into LeNet"
  - "Update the running mean while training"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

Batch normalization subtracts a per-channel mean, divides by the standard deviation, then multiplies by gamma and adds beta. Gamma starts at 1 and beta starts at 0. Training uses the current batch and also updates the running mean and variance. Evaluation uses only those running statistics.

### A 2 by 2 example

Two rows are one batch and two columns are two channels. The first column is 1 and 3, the mean is 2, and the centered values are about -1 and 1. eps still leaves the printed four decimals at -1.0 and 1.0.

```numpy run expect="cell -1.0 1.0" title="A 2 by 2 example"
# Two rows and two columns
import minitorch as mt
raw = mt.tensor([[1.0, 2.0], [3.0, 4.0]])
norm = mt.nn.BatchNorm(2)
y = norm(raw)
print("cell", round(float(y.data[0, 0]), 4), round(float(y.data[1, 0]), 4))
```

### Insert it into LeNet for four steps

A BatchNorm sits after each convolution and before the sigmoid. The rest matches the LeNet section: input edge 28, four steps, batches of four, and eight check images.

```numpy run expect="loss" title="Insert it into LeNet for four steps"
# Normalize after each convolution
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.BatchNorm(6), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.BatchNorm(16), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(400, 120), mt.nn.Sigmoid(),
    mt.nn.Linear(120, 84), mt.nn.Sigmoid(),
    mt.nn.Linear(84, 10),
)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]).reshape(4, 1, 28, 28)
    loss = mt.cross_entropy(net(mt.tensor(xb)), y[step * 4:(step + 1) * 4])
    loss.backward()
    opt.step()
    last = loss.item()
net.eval()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt).reshape(8, 1, 28, 28))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### eval switches to the running statistics

Each of the four forwards mixes the running statistics with momentum 0.1. After eval, the check images no longer use their own mean.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/batch-norm.html) and [en](https://d2l.ai/chapter_convolutional-modern/batch-norm.html).
