---
language: dl
chapter: 81
title: "Gradient descent"
level: intermediate
minutes: 8
goals:
  - "Push a square down with its derivative"
  - "Take four steps from 4"
  - "Compare one step with four"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The goal is to shrink the square of x. The derivative is 2x. With learning rate 0.25, each step multiplies x by 0.5. Starting at 4, the loss after four steps is the remaining square.

### Halve four times

4 times 0.5 to the fourth is 0.25, and the square is 0.0625. The print includes loss. There is no random draw, because every step uses the same derivative.

```numpy run expect="loss 0.0625" title="Four halvings"
# Multiply by 0.5 each step
x = 4.0
lr = 0.25
for _ in range(4):
    x = x - lr * (2.0 * x)
print("loss", round(x * x, 4))
```

### The result of one step

One step turns 4 into 2. This block prints that single multiplication so it can be compared with 0.25 after four steps.

```numpy run expect="2.0" title="One step"
# 4 times 0.5 is 2
x = 4.0
print(round(x * (1.0 - 2.0 * 0.25), 4))
```

### The next section uses one sample at a time

Full gradient sees every term on every step. Stochastic gradient descent picks one index per step, so the gradient jitters and the four-step loss is no longer the exact decimal above.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/gd.html) and [en](https://d2l.ai/chapter_optimization/gd.html).
