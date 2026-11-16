---
language: dl
chapter: 129
title: "The hypothesis attends to the premise"
level: intermediate
minutes: 8
goals:
  - "Use the hypothesis as the query"
  - "Use the premise as key and value"
  - "Score three classes across four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The attention inference page clips each sentence to six words and embeds them at width 8. The hypothesis is the query. The premise is the key and the value. The attention output is averaged over time and then split into three classes. Eight pairs form two batches, used alternately for four steps.

### Three-class cross-entropy

The batch for the four steps is 4. The loss is three-class cross-entropy. This page does not add an accuracy on the check split.

```numpy run expect="loss" title="Three-class cross-entropy"
# four steps with attention
import minitorch as mt
import numpy as np
np.random.seed(0)
left, right, labels, _vl, _vr, _vy = mt.nli_pairs()
vocab = sorted(set(" ".join(left + right).split()))
stoi = {w: i for i, w in enumerate(vocab)}

def pack(rows):
    table = []
    for line in rows:
        ids = [stoi[w] for w in line.split()]
        row = []
        i = 0
        while i < 6:
            row.append(ids[i] if i < len(ids) else 0)
            i += 1
        table.append(row)
    return np.array(table)

emb = mt.nn.Embedding(len(vocab), 8)
attn = mt.nn.MultiHeadAttention(8, 2)
head = mt.nn.Linear(8, 3)
opt = mt.optim.SGD(emb.parameters() + attn.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    query = emb(pack(right[start:start + 4]))
    memory = emb(pack(left[start:start + 4]))
    pooled = attn(query, memory, memory).mean(axis=1)
    loss = mt.cross_entropy(head(pooled), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Averaging leaves the width

The attention output is 4 by 6 by 8. Averaging over time leaves 4 by 8, which is what the linear layer receives.

```numpy run expect="pool 4 8" title="Averaging leaves the width"
# shape after the mean
import minitorch as mt
import numpy as np
np.random.seed(0)
q = mt.tensor(np.zeros((4, 6, 8)))
k = mt.tensor(np.zeros((4, 6, 8)))
y = mt.nn.MultiHeadAttention(8, 2)(q, k, k).mean(axis=1)
print("pool", y.shape[0], y.shape[1])
```

### The query is not swapped with the premise

The attention inference page always uses the hypothesis to look at the premise. It does not run the two directions separately, and it does not attach an outside pair archive.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-attention.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-attention.html).
