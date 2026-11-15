---
language: dl
chapter: 21
title: "Multilayer perceptron"
level: intermediate
minutes: 8
goals:
  - "See how a rectifier treats a negative"
  - "Build a small three-stage forward"
  - "Check the output shape"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The numeric rectifier example uses three numbers. A second block sends a four-dimensional input through eight hidden units and down to three outputs, and prints only the shape.

### Rectifier on three numbers

Negative 1.5 becomes 0, 0 stays 0, and 2.5 stays 2.5. The print casts the first two to integers and keeps the decimal on the last one.

```numpy run expect="0 0 2.5" title="Rectifier values"
# Negatives are cut to 0
import minitorch as mt
x = mt.tensor([-1.5, 0.0, 2.5])
y = x.relu()
print(int(y.data[0]), int(y.data[1]), y.data[2])
```

### Shape of a four-dimensional input

After the seed is fixed, the block builds a sequence: linear, rectifier, linear. One row of four columns goes in and one row of three columns comes out. No loss is computed.

```numpy run expect="shape 1 3" title="Forward shape"
# Hidden width is 8
import minitorch as mt
import numpy as np
np.random.seed(0)
net = mt.nn.Sequential(mt.nn.Linear(4, 8), mt.nn.ReLU(), mt.nn.Linear(8, 3))
out = net(mt.tensor([[1.0, 0.0, 0.0, 1.0]]))
print("shape", out.shape[0], out.shape[1])
```

### Training waits for the next section

When this structure is attached to 784 pixels, the hidden width becomes 32 and the output size becomes 10. That section is the one that takes four update steps.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/mlp.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/mlp.html).
