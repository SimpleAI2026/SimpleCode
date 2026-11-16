---
language: dl
chapter: 69
title: "Beam search"
level: beginner
minutes: 8
goals:
  - "Use fixed scores rather than a network"
  - "Keep the beam width at 2"
  - "Print the best path after three steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Beam search keeps only the highest-scoring paths at each step. The scores on this page are a fixed 3 by 3 matrix, and the beam width is 2.

### Keep two paths

Each step adds the log score of a new word to an old path, sorts, and keeps the first two.

```numpy run expect="beam 1 0 2" title="Keep two paths"
# Beam width 2
import numpy as np
scores = np.array([
    [0.1, 0.6, 0.3],
    [0.5, 0.2, 0.3],
    [0.2, 0.2, 0.6],
])
beam = [(0.0, [])]
for row in scores:
    nxt = []
    for total, path in beam:
        for token, score in enumerate(row):
            nxt.append((total + float(np.log(score)), path + [int(token)]))
    nxt.sort(key=lambda item: item[0], reverse=True)
    beam = nxt[:2]
best = beam[0][1]
print("beam", best[0], best[1], best[2])
```

### The best score is negative

Log scores are negative. The rounded total is printed so the sort direction can be checked.

```numpy run expect="score -1.7148" title="The best score is negative"
# Log scores
import numpy as np
scores = np.array([
    [0.1, 0.6, 0.3],
    [0.5, 0.2, 0.3],
    [0.2, 0.2, 0.6],
])
beam = [(0.0, [])]
for row in scores:
    nxt = []
    for total, path in beam:
        for token, score in enumerate(row):
            nxt.append((total + float(np.log(score)), path + [int(token)]))
    nxt.sort(key=lambda item: item[0], reverse=True)
    beam = nxt[:2]
print("score", round(beam[0][0], 4))
```

### A trained model is not required

The path on this beam-search page comes from that fixed score table. It does not read the 16 pairs and it does not update weights.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/beam-search.html) and [en](https://d2l.ai/chapter_recurrent-modern/beam-search.html).
