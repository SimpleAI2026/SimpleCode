---
language: dl
chapter: 44
title: "LeNet"
level: beginner
minutes: 8
goals:
  - "Build two convolutions and three linear layers"
  - "Take four steps on 32 images"
  - "Check that the output is 4 by 10"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

The first convolution uses a kernel of 5 and padding 2, so the edge of 28 stays put, then average pooling makes 14. The second convolution uses a kernel of 5 and no padding, which makes 10, then pooling makes 5. Flattening yields 400, then 120, 84, and 10. The activation is sigmoid.

### Four steps and one check

The learning rate is 0.1. Each step takes four images already scaled into 0 to 1 and lays them out as NCHW. The eight check images are evaluated once after the four steps.

```numpy run expect="loss" title="Four steps and one check"
# LeNet with two convolutions
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.Sigmoid(),
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

### Shape on four zero images

This block does not read the image file. Four all-zero 28 by 28 images should leave the network as four rows and ten columns, one score per class.

```numpy run expect="shape 4 10" title="Shape on four zero images"
# Do not read the image file
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 6, 5, padding=2), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Conv2d(6, 16, 5), mt.nn.Sigmoid(),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(400, 120), mt.nn.Sigmoid(),
    mt.nn.Linear(120, 84), mt.nn.Sigmoid(),
    mt.nn.Linear(84, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### The structure does not enlarge the image

The input edge stays 28. Padding appears only on the first layer, so the map is still 28 before the first pool, rather than stretching the image into a larger square.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/lenet.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/lenet.html).
