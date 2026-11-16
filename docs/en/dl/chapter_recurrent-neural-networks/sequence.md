---
language: dl
chapter: 54
title: "Sequences"
level: beginner
minutes: 8
goals:
  - "Predict the next term of an arithmetic run"
  - "Lay 16 numbers out as 4 by 4"
  - "Meet a sequence before any text"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A sequence is numbers laid out in time. This page does not read text. It uses one run with a fixed step, then lays sixteen numbers into four rows.

### Step and the next term

Neighbors differ by 2. The last term is 9, so one more step lands on 11.

```numpy run expect="next 11.0" title="Step and the next term"
# A fixed step
import numpy as np
x = np.array([1.0, 3.0, 5.0, 7.0, 9.0])
step = x[1] - x[0]
print("step", step)
print("next", x[-1] + step)
```

### Lay the numbers into a batch

Sixteen consecutive integers become 4 rows by 4 columns. The row is the batch axis used later.

```numpy run expect="shape 4 4" title="Lay the numbers into a batch"
# Four rows and four columns
import numpy as np
raw = np.arange(16, dtype=np.float64)
batch = raw.reshape(4, 4)
print("shape", batch.shape[0], batch.shape[1])
```

### Text is not on this page

The sequence here is handwritten numbers. The next page is the one that cuts synthetic sentences into words. This sequence page stops at the arithmetic next term.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/sequence.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/sequence.html).
