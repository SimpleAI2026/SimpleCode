---
language: dl
chapter: 52
title: "Dense connections"
level: intermediate
minutes: 8
goals:
  - "Append new features after the old channels"
  - "Use a growth of 4"
  - "Take four steps after two layers"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

A dense layer uses a 3 by 3 convolution to make growth new channels, then concatenates them with the input. The original DenseNet stacks many layers. Here a pool first makes 14, then two layers with growth 4 take the channels from 8 to 16.

### Four steps and one check

The second pool makes 7 by 7. Sixteen channels flatten to 784, then a linear layer makes 10. The batch is 4, there are four steps, and the check set has 8 images.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Dense(mt.nn.Module):
    def __init__(self, cin, growth):
        self.conv = mt.nn.Conv2d(cin, growth, 3, padding=1)
    def forward(self, x):
        y = self.conv(x).relu()
        return mt.cat([x, y], axis=1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Dense(8, 4),
    Dense(12, 4),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
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

### Output shape on a zero image

Concatenation needs every dimension except channels to agree. A 3 by 3 with padding 1 keeps the edge, so cat can join them. Zero images produce four rows and ten columns.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
class Dense(mt.nn.Module):
    def __init__(self, cin, growth):
        self.conv = mt.nn.Conv2d(cin, growth, 3, padding=1)
    def forward(self, x):
        y = self.conv(x).relu()
        return mt.cat([x, y], axis=1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Dense(8, 4),
    Dense(12, 4),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

Two layers with growth 4 also print a hit rate on eight check images. New channels are appended after the old ones, and the rate is only a reading.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/densenet.html) and [en](https://d2l.ai/chapter_convolutional-modern/densenet.html).
