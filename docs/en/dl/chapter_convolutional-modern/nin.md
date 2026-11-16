---
language: dl
chapter: 48
title: "1x1 convolution"
level: intermediate
minutes: 8
goals:
  - "Put two 1 by 1 convolutions in each block"
  - "Replace a large linear layer with global average pooling"
  - "Emit 10 classes directly"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

A NiN block is one ordinary convolution plus two 1 by 1 convolutions. The 1 by 1 mix channels at each pixel. The original network is wider. Here the three blocks use 8, 16, and 10 channels, and a final average pool over 7 by 7 yields one number per class.

### Four steps and one check

The last map already has 10 channels and is 1 by 1, so flattening is 10 numbers and there is no large dense layer after it. The four steps use learning rate 0.1.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
def nin_block(cin, cout, k, stride, pad):
    return mt.nn.Sequential(
        mt.nn.Conv2d(cin, cout, k, stride=stride, padding=pad), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
    )
net = mt.nn.Sequential(
    nin_block(1, 8, 5, 1, 2),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(8, 16, 3, 1, 1),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(16, 10, 3, 1, 1),
    mt.nn.AvgPool2d(7),
    mt.nn.Flatten(),
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

Four zero images produce 4 rows and 10 columns. That column count comes from the last block's channel count, not from a 400-wide linear layer.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
def nin_block(cin, cout, k, stride, pad):
    return mt.nn.Sequential(
        mt.nn.Conv2d(cin, cout, k, stride=stride, padding=pad), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
        mt.nn.Conv2d(cout, cout, 1), mt.nn.ReLU(),
    )
net = mt.nn.Sequential(
    nin_block(1, 8, 5, 1, 2),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(8, 16, 3, 1, 1),
    mt.nn.MaxPool2d(2, stride=2),
    nin_block(16, 10, 3, 1, 1),
    mt.nn.AvgPool2d(7),
    mt.nn.Flatten(),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

NiN prints the fraction of eight check images that match. The last map already has ten channels, and that fraction is only for reading.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/nin.html) and [en](https://d2l.ai/chapter_convolutional-modern/nin.html).
