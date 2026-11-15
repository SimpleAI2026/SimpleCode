---
language: dl
chapter: 85
title: "AdaGrad"
level: intermediate
minutes: 8
goals:
  - "Accumulate squared gradients"
  - "Print loss after four steps"
  - "Compute a first step that lands on 0.5"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Each step adds the square of the gradient into an accumulator, then multiplies the learning rate by the gradient over the square root of that accumulator. The parameter moves from 0 toward 3 at learning rate 0.5 for four steps.

### Four accumulating steps

The accumulator starts at 0. A large gradient makes later steps shorter. Loss is printed at the end.

```numpy run expect="loss" title="AdaGrad steps"
# Learning rate 0.5
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.AdaGrad([w], lr=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The first displacement

The square of gradient -6 is 36 and the square root is 6. Learning rate 0.5 times -6 divided by 6 is -0.5, so the parameter moves from 0 to 0.5.

```numpy run expect="0.5" title="First displacement"
# The first step should reach 0.5
grad = -6.0
accum = grad * grad
step = 0.5 * grad / (accum ** 0.5 + 1e-8)
print(round(0.0 - step, 4))
```

### RMSProp forgets squares that are old

AdaGrad's accumulator only grows. The next section multiplies old squares by a coefficient below 1 so they fade.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/adagrad.html) and [en](https://d2l.ai/chapter_optimization/adagrad.html).
