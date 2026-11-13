---
language: dl
chapter: 25
title: "Weight decay"
level: intermediate
minutes: 8
goals:
  - "Compare decay on and off"
  - "Print one loss after each four-step run"
  - "Compute the penalty term alone"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The same four points and the same initial weight are fit twice. One optimizer does not penalize the weight. The other sets decay to 0.4. Both stop at four steps and the block prints two losses.

### With decay and without it

Decay is added onto the gradient and does not rewrite the stored gradient array. After four steps both losses share the word loss. One is not required to be smaller than the other.

```numpy run expect="loss" title="Two four-step runs"
# Decay 0 and decay 0.4
import numpy as np
import minitorch as mt
def fit(decay):
    w = mt.tensor(np.array([0.8, -0.6]), requires_grad=True)
    opt = mt.optim.SGD([w], lr=0.15, weight_decay=decay)
    x = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [1.0, -1.0]])
    y = np.array([0.2, -0.1, 0.3, 0.05])
    last = 0.0
    for _ in range(4):
        opt.zero_grad()
        pred = mt.tensor(x) @ w
        yt = mt.tensor(y)
        loss = ((pred - yt) * (pred - yt)).mean()
        loss.backward()
        opt.step()
        last = loss.item()
    return last
print("loss", round(fit(0.0), 4), round(fit(0.4), 4))
```

### Look at the penalty alone

With weight 0.8 and decay 0.4, the penalty term is decay times the square of the weight. It is not the loss from the previous block. It only shows the scale of the penalty.

```numpy run expect="penalty 0.256" title="Penalty term"
# 0.4 times 0.64
weight = 0.8
decay = 0.4
print("penalty", round(decay * weight * weight, 4))
```

### Dropout is a different constraint

Decay pulls the size of a weight back on every step. Dropout multiplies some hidden units by 0 using a mask from the caller, and only while the training flag is on.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/weight-decay.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/weight-decay.html).
