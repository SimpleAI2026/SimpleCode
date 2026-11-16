---
language: dl
chapter: 60
title: "Backprop through time"
level: beginner
minutes: 8
goals:
  - "Unroll three time steps"
  - "Read the hidden-to-hidden gradient"
  - "Skip the four-step training here"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Backprop through time connects three steps into one graph and differentiates a scalar loss. This page uses a width-1 cell and avoids a long sequence.

### Three steps

The input is 1 by 3 by 1. The time axis of the output is also 3, so the loop really took three steps.

```numpy run expect="steps 3" title="Three steps"
# Length 3
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((1, 3, 1)))
y, _ = mt.nn.RNN(1, 1)(x)
print("steps", y.shape[1])
```

### The hidden weight receives a gradient

Sum the three outputs and go backward. The print is the gradient of the single hidden-to-hidden weight.

```numpy run expect="grad" title="The hidden weight receives a gradient"
# Sum across the three steps
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.array([[[0.5], [-0.2], [0.1]]]))
rnn = mt.nn.RNN(1, 1)
y, _ = rnn(x)
y.sum().backward()
print("grad", round(float(rnn.weight_hh.grad.reshape(-1)[0]), 4))
```

### This page does not open the dataset

Backprop through time only shows a graph of length 3. The four-step training stays on the scratch page and the concise page, and it is not repeated here.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/bptt.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/bptt.html).
