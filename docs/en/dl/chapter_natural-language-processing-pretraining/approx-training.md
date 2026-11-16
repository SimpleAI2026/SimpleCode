---
language: dl
chapter: 115
title: "Two scores in negative sampling"
level: intermediate
minutes: 8
goals:
  - "Keep one score for the positive"
  - "Keep one score for the negative"
  - "Pass both through a sigmoid"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Approximate training replaces a normalization over the whole vocabulary with one positive and a few negatives. This page has one positive score, 1.2, and one negative score, -0.4. It only reads the sigmoid. Parameters do not step.

### Two sigmoids

The sigmoid of the positive score 1.2 is about 0.7685. The sigmoid of the negative score -0.4 is about 0.4013. The negative count is written as 1.

```numpy run expect="neg 1 0.7685 0.4013" title="Two sigmoids"
# sigmoid of the positive and the negative
import minitorch as mt
import numpy as np
score = np.array([1.2, -0.4])
sig = 1.0 / (1.0 + np.exp(-score))
print("neg", 1, round(float(sig[0]), 4), round(float(sig[1]), 4))
```

### The labels are 1 and 0

The positive target is 1 and the negative target is 0. Binary cross-entropy uses that pair. This snippet only prints the labels.

```numpy run expect="labels 1 0" title="The labels are 1 and 0"
# positive and negative labels
import minitorch as mt
import numpy as np
print("labels", 1, 0)
```

### A full-vocabulary softmax is not on this page

The negative-sampling page does not score all twelve words. It only shows how one positive and one negative become two sigmoids.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/approx-training.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/approx-training.html).
