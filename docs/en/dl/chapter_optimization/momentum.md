---
language: dl
chapter: 84
title: "Momentum"
level: intermediate
minutes: 8
goals:
  - "Accumulate the gradient in a velocity"
  - "Print loss after four steps"
  - "Compute the first position by hand"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Velocity is the previous velocity times 0.5 plus the current gradient. The parameter subtracts that velocity times learning rate 0.2. The target is still to carry a number from 0 toward 3, in four steps.

### Four momentum steps

The loss is the square of the parameter minus 3. Loss is printed at the end of the fourth step. Velocity keeps a fraction of the earlier direction.

```numpy run expect="loss" title="Momentum steps"
# Momentum coefficient 0.5
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Momentum([w], lr=0.2, momentum=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Velocity on the first step

Starting at 0, the gradient of the squared loss is -6. Velocity equals that gradient, and the parameter becomes 1.2. This block computes only the first step.

```numpy run expect="1.2" title="First step"
# 0 - 0.2 * (-6)
v = 0.0
grad = -6.0
v = 0.5 * v + grad
print(round(0.0 - 0.2 * v, 4))
```

### Later methods change the denominator

Momentum ignores the history of squared gradients. AdaGrad accumulates those squares and divides the step by their square root.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/momentum.html) and [en](https://d2l.ai/chapter_optimization/momentum.html).
