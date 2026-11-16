---
language: dl
chapter: 75
title: "Multi-head attention"
level: beginner
minutes: 8
goals:
  - "Split the width into two heads"
  - "Apply scaled dot-product attention and join"
  - "Return an output shape of 2 by 4 by 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Multi-head attention projects the query, key, and value to one width, then splits them into heads. Each head does scaled dot-product attention, and a linear layer follows the join.

### The output shape is unchanged

The input is 2 by 4 by 8, and two heads each see 4 dimensions. After the join and the projection the shape is still 2 by 4 by 8.

```numpy run expect="shape 2 4 8" title="The output shape is unchanged"
# Two heads
import minitorch as mt
import numpy as np
np.random.seed(0)
layer = mt.nn.MultiHeadAttention(8, 2)
y = layer(mt.tensor(np.zeros((2, 4, 8))), mt.tensor(np.zeros((2, 4, 8))), mt.tensor(np.zeros((2, 4, 8))))
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### One row of weights sums to 1

The softmax after the scaled dot product makes one query's weights over all keys sum to 1.

```numpy run expect="row 1.0" title="One row of weights sums to 1"
# Softmax
import minitorch as mt
import numpy as np
q = mt.tensor(np.ones((1, 2, 4)))
_ctx, weights = mt.dot_attention(q, q, q)
print("row", round(float(weights.data[0, 0].sum()), 4))
```

### The head count is stated here

Multi-head attention uses 2 heads and a model width of 8. It does not read text, and it ends once the shape is checked.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/multihead-attention.html) and [en](https://d2l.ai/chapter_attention-mechanisms/multihead-attention.html).
