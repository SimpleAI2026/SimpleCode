---
language: dl
chapter: 121
title: "One forward pass of a narrow encoder"
level: intermediate
minutes: 8
goals:
  - "Use width 16 and two heads"
  - "Keep the length at 6"
  - "Read only the output shape"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The encoder page narrows the structure: hidden width 16, two attention heads, a feed-forward width of 32, and length 6. The input is all zeros. One forward pass checks that the output is still 4 by 6 by 16.

### The shape stays 4 by 6 by 16

One encoder block holds attention, a residual, normalization, and a two-layer feed-forward network. A zero input keeps the batch, the length, and the width.

```numpy run expect="shape 4 6 16" title="The shape stays 4 by 6 by 16"
# shape of one forward pass
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((4, 6, 16)))
y = mt.nn.EncoderBlock(16, 2, 32)(x)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### Rows of the position table

The sine position table has 6 rows and 16 columns and is added to the token vectors. This snippet only prints the row count. It does not add it to token vectors.

```numpy run expect="pos 6 16" title="Rows of the position table"
# position-table shape
import minitorch as mt
import numpy as np
pos = mt.positional_encoding(6, 16)
print("pos", pos.shape[0], pos.shape[1])
```

### One forward pass does not update weights

The narrow-encoder page has no mask target and no four steps. The pretraining page is where four short lines add a mask loss to a next-line loss.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/bert.html).
