---
language: dl
chapter: 57
title: "The recurrent cell"
level: beginner
minutes: 8
goals:
  - "Write one time step with tanh"
  - "Check a hidden shape of 1 by 1 by 2"
  - "Keep the batch on the outside"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

One time step multiplies the current input and the previous hidden state by matrices, adds a bias, and applies tanh. The input shape is batch, time, features.

### One time step by hand

The weights are diagonal 0.5. Inputs 1 and 2 pass through tanh, and both hidden values can be checked by hand.

```numpy run expect="h0 0.4621" title="One time step by hand"
# Diagonal weights
import minitorch as mt
w_ih = mt.tensor([[0.5, 0.0], [0.0, 0.5]])
w_hh = mt.tensor([[0.0, 0.0], [0.0, 0.0]])
b = mt.tensor([0.0, 0.0])
x = mt.tensor([[1.0, 2.0]])
h = mt.tensor([[0.0, 0.0]])
y = (x @ w_ih.T + h @ w_hh.T + b).tanh()
print("h0", round(float(y.data[0, 0]), 4))
print("h1", round(float(y.data[0, 1]), 4))
```

### The batch is the outer axis

The module receives a tensor of 1 by 1 by 3: one sample, one time step, three features. The output keeps the hidden axis last.

```numpy run expect="shape 1 1 2" title="The batch is the outer axis"
# A single time step
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor([[0.2, -0.1, 0.4]])
h = mt.tensor([[0.0, 0.0]])
cell = mt.nn.RNN(3, 2)
y, h2 = cell(x.reshape(1, 1, 3), h)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### The formula comes before training

This page has no four-step update. The recurrent-cell page only checks the two tanh decimals and an output shape of 1 by 1 by 2.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/rnn.html).
