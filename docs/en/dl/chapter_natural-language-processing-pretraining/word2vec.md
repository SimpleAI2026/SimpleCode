---
language: dl
chapter: 114
title: "One window"
level: intermediate
minutes: 8
goals:
  - "Pair a center word with both neighbors"
  - "Write the dot product as one number"
  - "Leave the vectors untrained"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The window page uses three handwritten vectors and does not read a corpus. The center word sits in the middle, with one neighbor on each side. A larger dot product means the two directions are closer.

### Center against the left neighbor

The center is (1, 0) and the left neighbor is (0.6, 0.8). The dot product is 0.6. The window radius is written as 1.

```numpy run expect="window 1 0.6" title="Center against the left neighbor"
# center and the left neighbor
import minitorch as mt
import numpy as np
center = np.array([1.0, 0.0])
left = np.array([0.6, 0.8])
print("window", 1, round(float(center.dot(left)), 1))
```

### The right-hand dot product is 0

The right neighbor is (0, 1), perpendicular to the center, so the dot product is 0. There are 2 neighbors. This page does not draw a negative word.

```numpy run expect="sides 2 0.0" title="The right-hand dot product is 0"
# center and the right neighbor
import minitorch as mt
import numpy as np
center = np.array([1.0, 0.0])
right = np.array([0.0, 1.0])
print("sides", 2, round(float(center.dot(right)), 1))
```

### The window stays off the corpus

The three vectors on this one-window page are fixed, so the dot product can be checked. The real short lines and the negative words are on the later pretraining page.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word2vec.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/word2vec.html).
