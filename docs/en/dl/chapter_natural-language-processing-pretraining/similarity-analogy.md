---
language: dl
chapter: 120
title: "Cosine after four steps"
level: intermediate
minutes: 8
goals:
  - "Run negative sampling for four steps first"
  - "Then read the cosine of two word vectors"
  - "Do not run analogies on outside vectors"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The similarity page runs the same four negative-sampling steps and gets a table of 12 by 8. It then prints only the cosine of row 0 and row 1. That number is not a claim about meaning, because the sentences are drawn.

### Cosine beside the loss

The four steps match the negative-sampling page. The cosine uses word 0 and word 1. A tiny number is added in the denominator so a zero length does not break the division.

```numpy run expect="loss" title="Cosine beside the loss"
# cosine after four steps
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
a = emb.weight.data[0]
b = emb.weight.data[1]
cos = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
print("loss", round(last, 4), "cos", round(cos, 4))
```

### Two perpendicular directions

The handwritten vectors (1, 0) and (0, 1) have cosine 0. That only checks the formula. It does not use the table trained above.

```numpy run expect="cos 0.0" title="Two perpendicular directions"
# two perpendicular vectors
import minitorch as mt
import numpy as np
a = np.array([1.0, 0.0])
b = np.array([0.0, 1.0])
cos = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
print("cos", round(cos, 1))
```

### No king-and-queen analogy

The similarity page does not run an analogy by adding and subtracting outside vectors. The cosine after four steps only shows that two random rows were nudged.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/similarity-analogy.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/similarity-analogy.html).
