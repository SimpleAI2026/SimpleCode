---
language: dl
chapter: 87
title: "Adadelta"
level: intermediate
minutes: 8
goals:
  - "Record squared gradients and squared steps"
  - "Expect a small first move"
  - "Print the default constants"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Each step keeps both a squared gradient and a squared update. The default learning rate is 1 and rho is 0.9. The parameter starts at 0, and loss is printed after four steps.

### Four Adadelta steps

On the first step the update accumulator is still 0, so the numerator is only a tiny stabilizer and the move is short. After four steps the loss is still near 9. That is expected, not a failure.

```numpy run expect="loss" title="Adadelta steps"
# The first step is short
import minitorch as mt
w = mt.tensor([0.0], requires_grad=True)
opt = mt.optim.Adadelta([w], lr=1.0, rho=0.9)
last = 0.0
for _ in range(4):
    opt.zero_grad()
    loss = ((w - 3.0) * (w - 3.0)).sum()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Two constants

Rho prints as 0.9 and the stabilizer prints as 1e-6. Those are the defaults of this implementation, the same pair used by the four steps above.

```numpy run expect="rho 0.9" title="Default constants"
# Default rho and eps
print("rho", 0.9, "eps", "1e-6")
```

### Adam corrects the startup bias

Adam also keeps a first and a second moment, but divides by 1 minus beta to the step count, so the early moments are not left too small by the starting zeros.

Pages: [zh](https://zh.d2l.ai/chapter_optimization/adadelta.html) and [en](https://d2l.ai/chapter_optimization/adadelta.html).
