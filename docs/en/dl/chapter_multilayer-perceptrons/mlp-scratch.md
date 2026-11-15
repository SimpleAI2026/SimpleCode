---
language: dl
chapter: 22
title: "Perceptron from scratch"
level: intermediate
minutes: 8
goals:
  - "Write the hidden and output layers apart"
  - "Take four steps on 32 images"
  - "Print loss and acc"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The hidden layer and the output layer are written separately. The input is four scaled clothing images, the hidden width is 32, and there are 10 classes. After four SGD steps, acc is printed on eight check images.

### Two layers and four steps

The hidden output is rectified before the second linear layer. The learning rate is 0.2. Loss and acc are separate lines, and acc is not a gate.

```numpy run expect="loss" title="Scratch perceptron"
# Hidden width 32
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
hidden = mt.nn.Linear(784, 32)
out = mt.nn.Linear(32, 10)
opt = mt.optim.SGD(hidden.parameters() + out.parameters(), lr=0.2)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(out(hidden(xb).relu()), yb)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(out(hidden(mt.tensor(mt.datasets.scale_batch(xt))).relu()), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### The widths are in the print

The other block does not read images. It prints the hidden width, the class count, and the step count so they can be checked against the loop above.

```numpy run expect="hidden 32 classes 10 steps 4" title="Widths"
# Match width and step count
print("hidden", 32, "classes", 10, "steps", 4)
```

### A sequence container is next

The hand-written order is hidden, rectifier, output. The concise section puts those three stages into Sequential, and the optimizer receives every parameter at once.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp-scratch.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/mlp-scratch.html).
