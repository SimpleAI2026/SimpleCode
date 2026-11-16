---
language: dl
chapter: 76
title: "Self-attention and positions"
level: beginner
minutes: 8
goals:
  - "Take query, key, and value from one sequence"
  - "Use sine and cosine for position"
  - "Keep the sequence length at 4"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Self-attention lets one sequence serve as query, key, and value. A sine-cosine position encoding is added to the representation. The first two numbers at position 0 are 0 and 1.

### The first two numbers at position 0

Even axes are sine and odd axes are cosine. At position 0 the sine is 0 and the cosine is 1.

```numpy run expect="pe01 1.0" title="The first two numbers at position 0"
# Sine and cosine
import minitorch as mt
pe = mt.positional_encoding(4, 8)
print("pe00", round(float(pe[0, 0]), 4))
print("pe01", round(float(pe[0, 1]), 4))
```

### A sequence attends to itself

One sequence of length 4 and width 8 is the query, the key, and the value at once. The output shape stays the same.

```numpy run expect="shape 1 4 8" title="A sequence attends to itself"
# The three inputs match
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((1, 4, 8)))
y = mt.nn.MultiHeadAttention(8, 2)(x, x, x)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### The positions are not learned

The position encoding is a constant and is not in the parameter list. This self-attention page stops at pe01 equal to 1 and the shape 1 by 4 by 8.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/self-attention-and-positional-encoding.html) and [en](https://d2l.ai/chapter_attention-mechanisms/self-attention-and-positional-encoding.html).
