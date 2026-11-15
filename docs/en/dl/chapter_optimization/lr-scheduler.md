---
language: dl
chapter: 89
title: "Learning-rate schedule"
level: intermediate
minutes: 8
goals:
  - "Multiply the learning rate by 0.5 every two steps"
  - "Read 0.05 after four steps"
  - "Recompute that factor alone"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

The optimizer starts at learning rate 0.2. The schedule multiplies that rate by 0.5 every two steps. After four updates the rate should be 0.05, and the loss is printed beside it.

### The factor across four steps

Each iteration updates the parameter first, then advances the schedule. On the fourth call, the step count divided by 2 is 2, and 0.2 times 0.5 squared is 0.05.

```numpy run expect="lr 0.05" title="Scheduled steps"
# Multiply by 0.5 every two steps
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.SGD([w], lr=0.2)
sched = mt.optim.StepLR(opt, step_size=2, gamma=0.5)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    sched.step()
    last = loss.item()
print("loss", round(last, 4), "lr", round(opt.lr, 4))
```

### Compute the factor alone

No parameter is built. The block multiplies 0.2 by 0.5 squared. The print should match the learning rate at the end of the previous block.

```numpy run expect="lr 0.05" title="The factor"
# 0.2 * 0.25
base = 0.2
gamma = 0.5
print("lr", round(base * (gamma ** (4 // 2)), 4))
```

### The schedule does not change the optimizer kind

The factor wraps SGD. Adam or momentum can call the same schedule after their own step, as long as the object exposes a learning rate.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/lr-scheduler.html) and [en](https://d2l.ai/chapter_optimization/lr-scheduler.html).
