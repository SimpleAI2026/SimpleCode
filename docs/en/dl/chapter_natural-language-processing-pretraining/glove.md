---
language: dl
chapter: 118
title: "Four steps on co-occurrence"
level: intermediate
minutes: 8
goals:
  - "Count neighbors on the same 32 lines"
  - "Fit the log of the count"
  - "Do not download ready-made vectors"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The global-vector page does not download a vector file of tens of megabytes. It counts left and right neighbors on the same 32 lines, then asks the dot product of two word vectors to approach the log of that count. Four steps take four nonzero cells each.

### Squared error against the log

The prediction is the dot product plus two biases. The target is the log of the co-occurrence count. The loss is the mean of the squared gap.

```numpy run expect="loss" title="Squared error against the log"
# four steps on co-occurrence
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
stoi = {w: i for i, w in enumerate(vocab)}
co = np.zeros((len(vocab), len(vocab)))
for line in rows:
    ids = [stoi[w] for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                co[ids[i], ids[j]] += 1
            j += 1
        i += 1
nz = np.argwhere(co > 0)
emb = mt.nn.Embedding(len(vocab), 8)
bi = mt.tensor(np.zeros(len(vocab)), requires_grad=True)
bj = mt.tensor(np.zeros(len(vocab)), requires_grad=True)
opt = mt.optim.SGD(emb.parameters() + [bi, bj], lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = nz[step * 4:(step + 1) * 4]
    ii = batch[:, 0]
    jj = batch[:, 1]
    dot = (emb(ii) * emb(jj)).sum(axis=1)
    pred = dot + bi[ii] + bj[jj]
    diff = pred - mt.tensor(np.log(co[ii, jj]))
    loss = (diff * diff).mean()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Nonzero cells cover four steps

In the twelve-by-twelve table, the cells above zero are far more than 16. Four steps take only the first 16 in scan order.

```numpy run expect="cells 129" title="Nonzero cells cover four steps"
# nonzero co-occurrence cells
import minitorch as mt
import numpy as np
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
co = np.zeros((len(vocab), len(vocab)))
for line in rows:
    ids = [vocab.index(w) for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                co[ids[i], ids[j]] += 1
            j += 1
        i += 1
print("cells", int((co > 0).sum()))
```

### No weighted pass over the whole table

The co-occurrence page does not multiply every cell by a saturating weight, and it does not store the biases as a published vector file. Four steps only check the squared loss.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/glove.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/glove.html).
