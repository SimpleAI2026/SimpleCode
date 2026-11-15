---
language: dl
chapter: 51
title: "Residual blocks"
level: intermediate
minutes: 8
goals:
  - "Add a convolution branch to a shortcut"
  - "Project with 1 by 1 when channels differ"
  - "Take four steps with two blocks"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

A residual block adds the input to the result of two 3 by 3 convolutions. When the channel count or the stride changes, the shortcut becomes a 1 by 1 convolution. The original ResNet has many stages. Here two blocks sit on a 28 image, with channels going from 8 to 16.

### Four steps and one check

The second block has stride 2, so the edge goes from 28 to 14, then average pooling makes 7. Flattening makes 784 and a linear layer makes 10. The learning rate is 0.1.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
class Residual(mt.nn.Module):
    def __init__(self, cin, cout, stride=1):
        self.conv1 = mt.nn.Conv2d(cin, cout, 3, stride=stride, padding=1)
        self.conv2 = mt.nn.Conv2d(cout, cout, 3, padding=1)
        self.proj = None
        if stride != 1 or cin != cout:
            self.proj = mt.nn.Conv2d(cin, cout, 1, stride=stride)
    def forward(self, x):
        y = self.conv2(self.conv1(x).relu())
        skip = x if self.proj is None else self.proj(x)
        return (y + skip).relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    Residual(8, 8),
    Residual(8, 16, stride=2),
    mt.nn.AvgPool2d(2, stride=2),
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

Zero images pass through the same two blocks. The output is four rows and ten columns, so the projection branch and the main branch have shapes that can be added.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
class Residual(mt.nn.Module):
    def __init__(self, cin, cout, stride=1):
        self.conv1 = mt.nn.Conv2d(cin, cout, 3, stride=stride, padding=1)
        self.conv2 = mt.nn.Conv2d(cout, cout, 3, padding=1)
        self.proj = None
        if stride != 1 or cin != cout:
            self.proj = mt.nn.Conv2d(cin, cout, 1, stride=stride)
    def forward(self, x):
        y = self.conv2(self.conv1(x).relu())
        skip = x if self.proj is None else self.proj(x)
        return (y + skip).relu()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 3, padding=1), mt.nn.ReLU(),
    Residual(8, 8),
    Residual(8, 16, stride=2),
    mt.nn.AvgPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(784, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

Two residual blocks print one hit rate on eight check images. The shortcut is already connected, and that rate is not a pass condition.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/resnet.html) and [en](https://d2l.ai/chapter_convolutional-modern/resnet.html).
