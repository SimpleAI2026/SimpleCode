---
language: dl
chapter: 9
title: "Automatic differentiation"
level: beginner
minutes: 8
goals:
  - "Backpropagate a sum of squares"
  - "Read the gradient of each input"
  - "Check the exp-then-log gradient"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

A scalar loss can walk backward into every input that asked for a gradient. The gradient of a sum of squares is twice the input. Exponent then logarithm should bring that gradient back to 1.

### Gradient of a sum of squares

The inputs are 2 and 3. Each one is squared and the squares are added. After the backward pass the gradients are 4 and 6. Backward accepts only a scalar, so the sum comes first.

```numpy run expect="4 6" title="Sum of squares"
# The gradient is twice the input
import minitorch as mt
x = mt.tensor([2.0, 3.0], requires_grad=True)
y = (x * x).sum()
y.backward()
print(int(x.grad[0]), int(x.grad[1]))
```

### Exponent and logarithm cancel

Exponent followed by logarithm returns the input as a value. Differentiating at 2 rounds to 1. Both operations sit on the same graph.

```numpy run expect="1.0" title="Exp and log"
# Gradient of log(exp(x))
import minitorch as mt
x = mt.tensor([2.0], requires_grad=True)
y = x.exp().log()
y.backward()
print(round(float(x.grad[0]), 4))
```

### Skip the graph when no gradient is needed

A data batch does not request a gradient. Only the weight tensors turn recording on. A four-step update then does not pull the whole image into the backward pass.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/autograd.html) and [en](https://d2l.ai/chapter_preliminaries/autograd.html).
