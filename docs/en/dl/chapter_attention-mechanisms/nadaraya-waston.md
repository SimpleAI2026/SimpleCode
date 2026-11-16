---
language: dl
chapter: 72
title: "Kernel regression"
level: beginner
minutes: 8
goals:
  - "Weight five points with a Gaussian kernel"
  - "Put the query at 3"
  - "Check the weight and the prediction"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Kernel regression averages the points near a query. The weights come from a Gaussian kernel and grow as the distance shrinks. The five points on this page are handwritten.

### The weight on the query itself

The five x positions are 1 through 5, and the query is 3. The point closest to the query takes the largest share.

```numpy run expect="weight 0.4026" title="The weight on the query itself"
# A Gaussian kernel
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
query = 3.0
w = np.exp(-0.5 * (x - query) ** 2)
w = w / w.sum()
print("weight", round(float(w[2]), 4))
```

### The prediction after weighting

The five y values are multiplied by the same weights and added. The result lands among those y values.

```numpy run expect="pred 2.0156" title="The prediction after weighting"
# Five points
import numpy as np
x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y = np.array([1.0, 2.0, 1.5, 3.0, 2.5])
query = 3.0
w = np.exp(-0.5 * (x - query) ** 2)
w = w / w.sum()
print("pred", round(float((w * y).sum()), 4))
```

### This is one special case of attention

In this kernel regression the keys are the x positions and the values are the y positions. The kernel page stops at the prediction 2.0156 and does not enter sentences.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/nadaraya-waston.html) and [en](https://d2l.ai/chapter_attention-mechanisms/nadaraya-waston.html).
