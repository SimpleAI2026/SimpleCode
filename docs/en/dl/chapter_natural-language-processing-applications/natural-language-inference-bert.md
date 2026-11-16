---
language: dl
chapter: 131
title: "A random encoder on sentence pairs"
level: intermediate
minutes: 8
goals:
  - "Use only the first four pairs"
  - "Read the hypothesis side"
  - "Step a three-class head four times"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Pair fine-tuning starts a separate encoder of width 16 and does not share the previous page's weights. It takes the first four pairs and feeds the hypothesis, clipped to six words. The three-class labels on those pairs are 0, 0, 1, and 2. Four steps repeat that batch.

### Three classes from the hypothesis side

In this shortened page the encoder sees the hypothesis rather than the two sentences joined together. The loss is still three-class cross-entropy. The step size is 0.05.

```numpy run expect="loss" title="Three classes from the hypothesis side"
# four steps on four pairs
import minitorch as mt
import numpy as np
np.random.seed(0)
left, right, labels, _vl, _vr, _vy = mt.nli_pairs()
left, right, labels = left[:4], right[:4], labels[:4]
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

width = 16
tok = mt.nn.Embedding(len(vocab), width)
block = mt.nn.EncoderBlock(width, 2, 32)
head = mt.nn.Linear(width, 3)
opt = mt.optim.SGD(tok.parameters() + block.parameters() + head.parameters(), lr=0.05)
x = pack(right)
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(head(h[:, 0, :]), labels)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Labels of the first four pairs

The first four labels are 0, 0, 1, and 2. All three classes occur. This snippet only prints them. It does not backpropagate.

```numpy run expect="four 0 0 1 2" title="Labels of the first four pairs"
# the first four labels
import minitorch as mt
import numpy as np
_left, _right, labels, _vl, _vr, _vy = mt.nli_pairs()
print("four", int(labels[0]), int(labels[1]), int(labels[2]), int(labels[3]))
```

### The hypothesis enters the encoder alone

This pair-fine-tuning page does not join the premise and the hypothesis into one longer sequence. The premise stays in the data to show where the pair came from, and it does not enter the forward pass of these four steps.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-bert.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-bert.html).
