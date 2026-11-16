---
language: dl
chapter: 73
title: "Attention scoring"
level: beginner
minutes: 8
goals:
  - "Use a dot product for aligned directions"
  - "Add and apply tanh to see cancellation"
  - "Keep the matrices at two dimensions"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A scoring function turns a query and a key into one number. This page compares two: a plain dot product, and a sum followed by tanh.

### Dot product

The query is (1, 0). Its dot product with itself is 1, and its dot product with a perpendicular vector is 0.

```numpy run expect="dot 1.0 0.0" title="Dot product"
# Two keys
import numpy as np
q = np.array([1.0, 0.0])
k = np.array([[1.0, 0.0], [0.0, 1.0]])
dots = k @ q
print("dot", round(float(dots[0]), 1), round(float(dots[1]), 1))
```

### Add, then squash

When the query and the key are opposites, their sum is 0, and the sum after tanh is also 0. That is one additive score.

```numpy run expect="add 0.0" title="Add, then squash"
# Opposite vectors
import numpy as np
q = np.array([0.5, -0.5])
k = np.array([-0.5, 0.5])
score = float(np.tanh(q + k).sum())
print("add", round(score, 4))
```

### A score is not yet a weight

This scoring page prints unnormalized numbers. Dividing by the square root of the width and applying softmax waits for the multi-head page.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/attention-scoring-functions.html) and [en](https://d2l.ai/chapter_attention-mechanisms/attention-scoring-functions.html).
