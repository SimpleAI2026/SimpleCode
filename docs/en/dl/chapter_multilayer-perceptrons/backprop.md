---
language: dl
chapter: 27
title: "Backpropagation"
level: intermediate
minutes: 8
goals:
  - "Backpropagate a square"
  - "Read both gradients of a product"
  - "Reduce the graph to a scalar first"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Both small graphs are reduced to a scalar before the backward pass. The gradient of a square is twice the input. When a product gains an extra term, the two inputs have separate gradients.

### Value and gradient of a square

Input 3 squares to 9 and has gradient 6. The print writes the function value first and the gradient second.

```numpy run expect="9 6" title="Square graph"
# The square of 3 is 9
import minitorch as mt
x = mt.tensor([3.0], requires_grad=True)
y = (x * x).sum()
y.backward()
print(int(y.item()), int(x.grad[0]))
```

### A product plus an extra term

a is 2 and b is 4. y = a*b + a equals 10. The gradient in a is b+1, which is 5. The gradient in b is a, which is 2.

```numpy run expect="10 5 2" title="Product graph"
# Both leaves request a gradient
import minitorch as mt
a = mt.tensor([2.0], requires_grad=True)
b = mt.tensor([4.0], requires_grad=True)
y = (a * b + a).sum()
y.backward()
print(int(y.item()), int(a.grad[0]), int(b.grad[0]))
```

### The graph is not kept across sections

Every run builds new tensors. The dropout mask from the previous section is not on this graph. Stop discards the backward pass in progress, but this example is small enough to finish in one go.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/backprop.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/backprop.html).
