---
language: dl
chapter: 130
title: "A class head on a random encoder"
level: intermediate
minutes: 8
goals:
  - "Take only four reviews"
  - "Keep two of each label"
  - "Repeat that batch for four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The fine-tuning page does not load an encoder that was already trained. It initializes one block of width 16 and takes reviews 1, 2, 5, and 6, two positive and two negative. All four steps use those four lines. The class is read from the first position.

### Two classes from the first position

Token embeddings plus positions go through one encoder block. The loss is two-class cross-entropy. The step size is 0.05.

```numpy run expect="loss" title="Two classes from the first position"
# four steps on four reviews
import minitorch as mt
import numpy as np
np.random.seed(0)
texts, labels, _held, _held_y = mt.sentiment_reviews()
chosen = [texts[0], texts[1], texts[4], texts[5]]
y = np.array([labels[0], labels[1], labels[4], labels[5]])
vocab = sorted(set(" ".join(chosen).split()))
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

width = 16
tok = mt.nn.Embedding(len(vocab), width)
block = mt.nn.EncoderBlock(width, 2, 32)
head = mt.nn.Linear(width, 2)
opt = mt.optim.SGD(tok.parameters() + block.parameters() + head.parameters(), lr=0.05)
x = pack(chosen)
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(head(h[:, 0, :]), y)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### The label sum of these four

The four chosen labels sum to 2, so the two classes are even. This snippet does not train.

```numpy run expect="half 2 4" title="The label sum of these four"
# sum of the four labels
import minitorch as mt
import numpy as np
_texts, labels, _held, _held_y = mt.sentiment_reviews()
picked = np.array([labels[0], labels[1], labels[4], labels[5]])
print("half", int(picked.sum()), picked.shape[0])
```

### There is no finished weight file to load

The encoder on the fine-tuning page starts from uniform random numbers. After four steps it has still seen only four reviews, so it is not a sentiment model to keep.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/finetuning-bert.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/finetuning-bert.html).
