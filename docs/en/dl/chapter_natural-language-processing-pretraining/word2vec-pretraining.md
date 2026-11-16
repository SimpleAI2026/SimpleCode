---
language: dl
chapter: 117
title: "Four steps of negative sampling"
level: intermediate
minutes: 8
goals:
  - "Take one neighbor on each side"
  - "Pair each positive with one negative word"
  - "Print the loss across four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Pretraining uses the 32 lines from the previous page. Each center word links only to its left and right neighbors. Each positive pair draws one negative word. The embedding width is 8. Four steps take four pairs each. Vector quality is not judged.

### Positive loss plus negative loss

The positive label is 1 and the negative label is 0. The two binary cross-entropies are added. The printout is the last of the four steps.

```numpy run expect="loss" title="Positive loss plus negative loss"
# four steps of negative sampling
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
stoi = {w: i for i, w in enumerate(vocab)}
pairs = []
for line in rows:
    ids = [stoi[w] for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                pairs.append((ids[i], ids[j]))
            j += 1
        i += 1
emb = mt.nn.Embedding(len(vocab), 8)
opt = mt.optim.SGD(emb.parameters(), lr=0.1)
rng = np.random.RandomState(0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = pairs[step * 4:(step + 1) * 4]
    cen = np.array([p[0] for p in batch])
    ctx = np.array([p[1] for p in batch])
    neg = rng.randint(0, len(vocab), size=4)
    pos = (emb(cen) * emb(ctx)).sum(axis=1)
    bad = (emb(cen) * emb(neg)).sum(axis=1)
    loss = mt.bce_with_logits(pos, np.ones(4)) + mt.bce_with_logits(bad, np.zeros(4))
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The vocabulary is still 12

The embedding has 12 rows and 8 columns. This snippet only reads the shape. It does not backpropagate.

```numpy run expect="table 12 8" title="The vocabulary is still 12"
# embedding table shape
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
table = mt.nn.Embedding(len(vocab), 8)
print("table", table.weight.shape[0], table.weight.shape[1])
```

### One negative word is enough here

These four steps do not attach five negatives to each positive, and they do not report nearest neighbors. A loss that can be stepped is the check that the backward pass runs.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word2vec-pretraining.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/word2vec-pretraining.html).
