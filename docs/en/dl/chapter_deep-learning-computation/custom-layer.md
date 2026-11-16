---
language: dl
chapter: 35
title: "A custom layer"
level: beginner
minutes: 8
goals:
  - "Subclass Module"
  - "Scale a centered input by one scalar"
  - "See that scalar in the parameter list"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

A custom layer subclasses Module and writes forward. The layer below subtracts the mean, then multiplies by a trainable scalar. The input values are 1 and 3.

### Center, then scale

The mean is 2. The centered values are -1 and 1, and times 2 they are -2 and 2. The parameter list holds only that scalar.

```numpy run expect="out -2.0 2.0" title="Center, then scale"
# The scalar starts at 2
import minitorch as mt
class Center(mt.nn.Module):
    def __init__(self):
        self.scale = mt.tensor([2.0], requires_grad=True)
    def forward(self, x):
        return (x - x.mean()) * self.scale
layer = Center()
y = layer(mt.tensor([[1.0, 3.0]]))
print("out", float(y.data[0, 0]), float(y.data[0, 1]))
print("params", len(layer.parameters()))
```

### Gradient of the scalar

The loss is the sum of squares of the output. After centering, the sum of squares is 2, then multiplied by the square of the scalar. The derivative with respect to the scalar is 8.

```numpy run expect="grad 8.0" title="Gradient of the scalar"
# Derivative of the sum of squares
import minitorch as mt
class Center(mt.nn.Module):
    def __init__(self):
        self.scale = mt.tensor([2.0], requires_grad=True)
    def forward(self, x):
        return (x - x.mean()) * self.scale
layer = Center()
y = layer(mt.tensor([[1.0, 3.0]]))
(y * y).sum().backward()
print("grad", float(layer.scale.grad.reshape(-1)[0]))
```

### An optimizer can see the parameter

parameters walks attributes of the subclass. When the scalar is a tensor that requires grad, SGD can update it.

Pages: [zh](https://zh.d2l.ai/chapter_deep-learning-computation/custom-layer.html) and [en](https://d2l.ai/chapter_deep-learning-computation/custom-layer.html).
