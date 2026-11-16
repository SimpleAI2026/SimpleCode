---
language: dl
chapter: 46
title: "A smaller AlexNet"
level: intermediate
minutes: 8
goals:
  - "Keep convolution, pooling, dropout, and linear layers"
  - "Use channels 8, 16, and 12"
  - "Print loss after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

The original structure enlarges the image to 224, starts with a kernel of 11 and stride 4, and uses 96 channels upward. On an edge of 28 that second pool would be empty. Here the kernels are 5 and 3, the channels are 8, 16, and 12, and the two wide linear layers become 24.

### Four steps and one check

Dropout draws its own mask from a fixed seed, so the four steps can be repeated. eval is called before the check, and dropout then passes the input through. The learning rate is 0.1.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 5, padding=2), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(8, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 12, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(108, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=1),
    mt.nn.Linear(24, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=2),
    mt.nn.Linear(24, 10),
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

Three pools of stride 2 take 28 down to 14, 7, and 3. The last convolution has 12 channels, flattening makes 108, and the network then outputs 10 classes.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Sequential(
    mt.nn.Conv2d(1, 8, 5, padding=2), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(8, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 16, 3, padding=1), mt.nn.ReLU(),
    mt.nn.Conv2d(16, 12, 3, padding=1), mt.nn.ReLU(),
    mt.nn.MaxPool2d(2, stride=2),
    mt.nn.Flatten(),
    mt.nn.Linear(108, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=1),
    mt.nn.Linear(24, 24), mt.nn.ReLU(),
    mt.nn.Dropout(0.5, seed=2),
    mt.nn.Linear(24, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

On this reduced AlexNet the second printed number is acc over eight check images. With only 8 to 12 channels, a value near zero is expected after four updates.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/alexnet.html) and [en](https://d2l.ai/chapter_convolutional-modern/alexnet.html).
