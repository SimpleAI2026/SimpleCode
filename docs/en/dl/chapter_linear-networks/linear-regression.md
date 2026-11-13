---
language: dl
chapter: 13
title: "Linear regression"
level: beginner
minutes: 8
goals:
  - "Fit a line by least squares"
  - "Read the intercept and slope"
  - "Check the mean squared residual"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Four points sit on y = 1 + 2x. Least squares recovers the intercept and the slope, and the mean squared residual is 0.

### Solve for intercept and slope

The design matrix has a column of ones and a column 1 through 4. Least squares returns coefficients that round to 1 and 2, the same numbers used to build the points.

```numpy run expect="1.0 2.0" title="Least squares"
# Four points lie on the line
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])
design = np.column_stack([np.ones(4), x])
w, _, _, _ = np.linalg.lstsq(design, y, rcond=None)
print(round(float(w[0]), 2), round(float(w[1]), 2))
```

### The residual is zero

Predicting those same four x values with the same line matches the targets exactly. The mean squared gap prints as loss 0. This section adds no random noise.

```numpy run expect="loss 0.0" title="Zero residual"
# Predictions match the targets
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0])
y = 1.0 + 2.0 * x
pred = 1.0 + 2.0 * x
print("loss", round(float(np.mean((pred - y) ** 2)), 4))
```

### The next section updates step by step

The closed form finishes the coefficients in one solve. The from-scratch section switches to four small steps, each one using the current gradient of the loss.

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/linear-regression.html) and [en](https://d2l.ai/chapter_linear-networks/linear-regression.html).
