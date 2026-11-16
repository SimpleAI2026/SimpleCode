---
language: dl
chapter: 123
title: "Mask loss plus next-line loss"
level: intermediate
minutes: 8
goals:
  - "Repeat one batch of four lines for four steps"
  - "Predict the second word"
  - "Predict the next-line label from the first position"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Pretraining sends the four lines through one encoder block of width 16. The second position predicts the hidden word, and the first position predicts the handwritten next-line label. The two cross-entropies are added. All four steps use that same batch. The result is not a usable pretrained model.

### Both losses step together

Token embeddings plus sine positions enter the encoder. The mask target is the second word of each line. The next-line targets are 0, 1, 0, 1.

```numpy run expect="loss" title="Both losses step together"
# four steps on four lines
import minitorch as mt
import numpy as np
np.random.seed(0)
lines = mt.bert_segments()
vocab = sorted(set(" ".join(lines).split()))
stoi = {w: i for i, w in enumerate(vocab)}
ids = []
for line in lines:
    ids.append([stoi[w] for w in line.split()])
x = np.array(ids)
width = 16
tok = mt.nn.Embedding(len(vocab), width)
block = mt.nn.EncoderBlock(width, 2, 32)
mlm = mt.nn.Linear(width, len(vocab))
nsp = mt.nn.Linear(width, 2)
params = tok.parameters() + block.parameters() + mlm.parameters() + nsp.parameters()
opt = mt.optim.SGD(params, lr=0.1)
masked = np.array([row[1] for row in ids])
nxt = np.array([0, 1, 0, 1])
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(mlm(h[:, 1, :]), masked) + mt.cross_entropy(nsp(h[:, 0, :]), nxt)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### Width of the two heads

The mask head has as many columns as the vocabulary of these four lines. The next-line head is fixed at two columns. The vocabulary is counted from the four lines.

```numpy run expect="heads" title="Width of the two heads"
# columns of the two heads
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
vocab = sorted(set(" ".join(lines).split()))
print("heads", len(vocab), 2)
```

### Four steps are not a finished pretraining

Weights on the pretraining page start from random numbers, the length is only 6, and there is a single block. Printing the loss only shows that both terms can backpropagate.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert-pretraining.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/bert-pretraining.html).
