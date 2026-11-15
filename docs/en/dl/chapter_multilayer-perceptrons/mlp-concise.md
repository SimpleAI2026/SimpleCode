---
language: dl
chapter: 23
title: "Concise perceptron"
level: intermediate
minutes: 8
goals:
  - "Put a rectifier in a sequence"
  - "Clear the training flag after four steps"
  - "Count the parameter list"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Three stages sit in one sequence. The block calls train, finishes four steps, calls eval, then takes acc on eight check images. A second block prints how many parameters were created.

### Four steps on a sequence

The seed is 2 and the learning rate is 0.2. After eval, a dropout layer would turn off. This section has no dropout yet. The call only clears the training flag.

```numpy run expect="loss" title="Concise perceptron"
# Call train, then eval
import minitorch as mt
import numpy as np
np.random.seed(2)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Sequential(mt.nn.Linear(784, 32), mt.nn.ReLU(), mt.nn.Linear(32, 10))
net.train()
opt = mt.optim.SGD(net.parameters(), lr=0.2)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(xb), yb)
    loss.backward()
    opt.step()
    last = loss.item()
net.eval()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### Each linear layer has a weight and a bias

The sequence has three stages. Two linear layers each contribute a weight and a bias, so the parameter list has length 4. The rectifier has none.

```numpy run expect="layers 3 params 4" title="Parameter count"
# The rectifier has no parameters
import minitorch as mt
import numpy as np
np.random.seed(3)
net = mt.nn.Sequential(mt.nn.Linear(784, 32), mt.nn.ReLU(), mt.nn.Linear(32, 10))
print("layers", len(net.layers), "params", len(net.parameters()))
```

### Underfitting switches to a polynomial

Four steps on images do not show whether a model is too simple or too rich. The next section uses a synthetic polynomial and compares degree-1 features with degree-3 features.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp-concise.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/mlp-concise.html).
