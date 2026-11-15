---
language: dl
chapter: 47
title: "VGG blocks"
level: intermediate
minutes: 8
goals:
  - "Each block is a few 3 by 3 convolutions then a pool"
  - "Use three blocks and channels 8 and 16"
  - "Take four steps on an edge of 28"
sources:
  - d2l-zh-text
  - d2l-en-text
  - fashion-mnist
updated: "2026-11-15"
---

A VGG block repeats 3 by 3 convolutions and then applies one max pool of stride 2. The original network has more blocks, channels up to 512, and a 224 image. Here there are three blocks, channels 8 and 16, and an input edge of 28.

### Four steps and one check

After three blocks the spatial edge is 3. Sixteen channels flatten to 144, then a linear layer makes 10. The batch is 4 and the check set has 8 images.

```numpy run expect="loss" title="Four steps and one check"
# Four steps, four images each
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
def vgg_block(cin, cout, convs):
    layers = []
    for i in range(convs):
        layers.append(mt.nn.Conv2d(cin if i == 0 else cout, cout, 3, padding=1))
        layers.append(mt.nn.ReLU())
    layers.append(mt.nn.MaxPool2d(2, stride=2))
    return mt.nn.Sequential(*layers)
net = mt.nn.Sequential(
    vgg_block(1, 8, 1),
    vgg_block(8, 16, 1),
    vgg_block(16, 16, 2),
    mt.nn.Flatten(),
    mt.nn.Linear(144, 10),
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

The zero input does not read a file. The output should still be four rows and ten columns, which means the last linear layer received 144 features.

```numpy run expect="shape 4 10" title="Output shape on a zero image"
# Four images of zeros
import minitorch as mt
import numpy as np
np.random.seed(1)
def vgg_block(cin, cout, convs):
    layers = []
    for i in range(convs):
        layers.append(mt.nn.Conv2d(cin if i == 0 else cout, cout, 3, padding=1))
        layers.append(mt.nn.ReLU())
    layers.append(mt.nn.MaxPool2d(2, stride=2))
    return mt.nn.Sequential(*layers)
net = mt.nn.Sequential(
    vgg_block(1, 8, 1),
    vgg_block(8, 16, 1),
    vgg_block(16, 16, 2),
    mt.nn.Flatten(),
    mt.nn.Linear(144, 10),
)
y = net(mt.tensor(np.zeros((4, 1, 28, 28))))
print("shape", y.shape[0], y.shape[1])
```

### Acc is not a gate

These three VGG blocks also print how many of the eight check images match. With channels stopped at 16, that figure does not have to rise.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-modern/vgg.html) and [en](https://d2l.ai/chapter_convolutional-modern/vgg.html).
