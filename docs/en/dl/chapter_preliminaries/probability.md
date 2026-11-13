---
language: dl
chapter: 10
title: "Probability"
level: beginner
minutes: 8
goals:
  - "Sample with an in-block generator"
  - "Fix the seed so the print repeats"
  - "Print a sample mean"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

Sampling uses a generator created inside the block, with a fixed seed, so each run prints the same line. Do not touch a global stream that could survive into the next run.

### Eight coin flips

The generator seed is 0. Each draw is an integer in {0, 1}, eight times. The block prints how many ones appeared and the total count. The count is fixed by the seed.

```numpy run expect="draws 3 8" title="Coin flips"
# Eight draws from seed 0
import numpy as np
rng = np.random.default_rng(0)
draws = rng.integers(0, 2, size=8)
print("draws", int(draws.sum()), int(draws.size))
```

### Mean of sixteen normal draws

A second generator, seed 1, draws sixteen standard normal numbers and prints only their mean. The mean is near 0, and these three decimals are pinned by the seed.

```numpy run expect="mean 0.128" title="Sample mean"
# Normal draws from seed 1
import numpy as np
rng = np.random.default_rng(1)
samples = rng.normal(0.0, 1.0, size=16)
print("mean", round(float(samples.mean()), 3))
```

### A class id is not itself a probability

Later image labels are integers from 0 to 9. Turning scores into probabilities waits for the softmax section. This page only checks that the printed sample stays stable.

Pages: [zh](https://zh.d2l.ai/chapter_preliminaries/probability.html) and [en](https://d2l.ai/chapter_preliminaries/probability.html).
