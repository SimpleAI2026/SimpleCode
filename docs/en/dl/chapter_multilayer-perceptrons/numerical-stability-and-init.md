---
language: dl
chapter: 28
title: "Stability and initialization"
level: intermediate
minutes: 8
goals:
  - "Avoid overflow in a large exponential"
  - "Print the largest stable probability"
  - "Set an initial scale from the input size"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Three huge scores overflow if they go straight into an exponential. Subtract the maximum first, then normalize. The largest entry is about 0.6652. Initialization keeps the weight scale tied to the square root of the input size.

### Subtract the maximum first

After subtracting 1002, the scores 1000, 1001, and 1002 become -2, -1, and 0. The exponentials are ordinary sized numbers. The share of the last entry is kept to four decimals.

```numpy run expect="0.6652" title="Stable softmax"
# Shift a large exponential first
import numpy as np
logits = np.array([1000.0, 1001.0, 1002.0])
shifted = logits - logits.max()
prob = np.exp(shifted)
prob = prob / prob.sum()
print(round(float(prob[-1]), 4))
```

### Scale by the input size

A four-by-eight weight uses a standard deviation of 1 over the square root of 8. The seed is 0. The print shows the row count, the column count, and three decimals of the sample standard deviation.

```numpy run expect="4 8" title="Initial scale"
# Initial weight from seed 0
import numpy as np
rng = np.random.default_rng(0)
weight = rng.normal(0.0, 1.0 / np.sqrt(8.0), size=(4, 8))
print(weight.shape[0], weight.shape[1], round(float(weight.std()), 3))
```

### The linear layer's own initialization is narrower

The linear layer on this page uses a uniform draw whose half-width is 1 over the square root of the input size. The normal example here only shows where a scale comes from. It does not replace that layer.

Pages: [zh](https://zh.d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html) and [en](https://d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html).
