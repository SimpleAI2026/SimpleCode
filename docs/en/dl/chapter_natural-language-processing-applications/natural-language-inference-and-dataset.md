---
language: dl
chapter: 128
title: "Twelve sentence pairs"
level: intermediate
minutes: 8
goals:
  - "Keep eight pairs for training and four for a check"
  - "Use three labels"
  - "Do not download an inference corpus"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The inference data is twelve handwritten short pairs. Label 0 is entailment, 1 is contradiction, and 2 is neutral. Eight pairs train and four are held for a check. This is not the large pair archive.

### Pair count and the first labels

Training has 8 pairs and the check split has 4. The first label is 0 and the third is 1.

```numpy run expect="pairs 8 4 0 1" title="Pair count and the first labels"
# pair counts
import minitorch as mt
import numpy as np
left, _right, labels, vleft, _vright, _vy = mt.nli_pairs()
print("pairs", len(left), len(vleft), int(labels[0]), int(labels[2]))
```

### All three classes appear

The training labels include 0, 1, and 2. The later attention page uses the hypothesis as the query and the premise as the key.

```numpy run expect="kinds 3" title="All three classes appear"
# label kinds
import minitorch as mt
import numpy as np
_left, _right, labels, _vl, _vr, _vy = mt.nli_pairs()
print("kinds", len(set(int(v) for v in labels)))
```

### Twelve pairs are not the public pair set

The sentences on the inference-data page were written so all three classes can be counted. Parsing them is a split on spaces. There are no part-of-speech tags or syntax trees.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-and-dataset.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-and-dataset.html).
