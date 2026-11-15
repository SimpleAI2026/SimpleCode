---
language: dl
chapter: 49
title: "Parallel branches"
level: intermediate
minutes: 8
goals:
  - "Concatenate four branches on the channel axis"
  - "Keep a single smaller Inception"
  - "Print loss after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

Inception runs a 1 by 1, a 3 by 3, a 5 by 5, and a pool followed by a 1 by 1, then concatenates on the channel axis. The original GoogLeNet stacks many of these modules and uses a 224 image. Here a single module sits on a 14 by 14 map, with 4 channels on each branch.

### Four steps and one check

Concatenation makes 16 channels. One more pool makes 7 by 7, flattening makes 784, and a linear layer makes 10. The batch is still 4.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Inception(mt.nn.Module):
    def __init__(self, cin):
        self.b1 = mt.nn.Conv2d(cin, 4, 1)
        self.b2 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 3, padding=1))
        self.b3 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 5, padding=2))
        self.pool = mt.nn.MaxPool2d(3, stride=1, padding=1)
        self.b4 = mt.nn.Conv2d(cin, 4, 1)
    def forward(self, x):
        y = mt.cat([self.b1(x), self.b2(x), self.b3(x), self.b4(self.pool(x))], axis=1)
        return y.relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Inception(8),
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

Padding on the four branches keeps one shared edge. Otherwise cat would be misaligned. On zero images the final shape is four rows and ten columns.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
class Inception(mt.nn.Module):
    def __init__(self, cin):
        self.b1 = mt.nn.Conv2d(cin, 4, 1)
        self.b2 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 3, padding=1))
        self.b3 = mt.nn.Sequential(mt.nn.Conv2d(cin, 4, 1), mt.nn.ReLU(), mt.nn.Conv2d(4, 4, 5, padding=2))
        self.pool = mt.nn.MaxPool2d(3, stride=1, padding=1)
        self.b4 = mt.nn.Conv2d(cin, 4, 1)
    def forward(self, x):
        y = mt.cat([self.b1(x), self.b2(x), self.b3(x), self.b4(self.pool(x))], axis=1)
        return y.relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    Inception(8),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

The single Inception also prints a hit rate on eight check images. After the four branches are joined, that rate can stay low.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/googlenet.html) and [en](https://d2l.ai/chapter_convolutional-modern/googlenet.html).
