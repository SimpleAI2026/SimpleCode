---
language: dl
chapter: 88
title: "Adam"
level: intermediate
minutes: 8
goals:
  - "Use a first and a second moment"
  - "Print loss after four steps"
  - "Check the bias correction"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The first and second moments both start at 0. Each step updates an exponential average, then divides by 1 minus beta to the step count. The learning rate is 0.2, and loss is printed after four steps.

### Four steps with bias correction

The default betas are 0.9 and 0.999. After the correction, the first moment on step one does not stay at one tenth of the gradient. Loss is printed at the end.

```numpy run expect="loss" title="Adam steps"
# Learning rate 0.2
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Adam([w], lr=0.2)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The corrected first moment

If the gradient is 0.4, the uncorrected first moment is 0.04. Dividing by 0.1 brings it back to 0.4. This block prints that correction and does not update a parameter.

```numpy run expect="0.4" title="Bias correction"
# 0.04 divided by 0.1
beta1 = 0.9
moment = (1.0 - beta1) * 0.4
corrected = moment / (1.0 - beta1)
print(round(corrected, 4))
```

### The learning rate can still be scaled

Adam's own learning rate stays constant across the four steps. The next section multiplies the learning rate by 0.5 every two steps, outside the optimizer.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/adam.html) and [en](https://d2l.ai/chapter_optimization/adam.html).
