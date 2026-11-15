---
language: dl
chapter: 86
title: "RMSProp"
level: intermediate
minutes: 8
goals:
  - "Decay old squared gradients"
  - "Print loss after four steps"
  - "Check the position after one step"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The squared accumulator is multiplied by 0.9 and then gains 0.1 times the new squared gradient. The learning rate is 0.1. The parameter still moves from 0 toward 3, and loss is printed after four steps.

### Four steps with forgetting

Rho is 0.9. Compared with AdaGrad, a very early squared gradient does not occupy the denominator forever.

```numpy run expect="loss" title="RMSProp steps"
# rho 0.9
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.RMSProp([w], lr=0.1, rho=0.9)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The denominator on the first step

The accumulator starts at 0, so the first step keeps only 0.1 times 36. The denominator is about 1.897. This block prints the parameter after that single step.

```numpy run expect="0.3162" title="First step"
# Keep one tenth of the square
grad = -6.0
accum = 0.1 * grad * grad
step = 0.1 * grad / (accum ** 0.5 + 1e-8)
print(round(0.0 - step, 4))
```

### Adadelta also records the update

RMSProp's numerator is still the learning rate times the gradient. Adadelta replaces that scale with how far the recent updates actually moved.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/rmsprop.html) and [en](https://d2l.ai/chapter_optimization/rmsprop.html).
