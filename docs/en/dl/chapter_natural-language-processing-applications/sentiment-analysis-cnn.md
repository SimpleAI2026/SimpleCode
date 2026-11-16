---
language: dl
chapter: 127
title: "A convolution over three words"
level: intermediate
minutes: 8
goals:
  - "Use a kernel three tokens high and as wide as the embedding"
  - "Keep the same eight lines for four steps"
  - "Print the loss and one accuracy"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The convolutional sentiment page lays six embeddings out as 1 by 6 by 8 and uses a kernel of height 3 and width 8 so each filter sees three words. The output is flattened into two classes. The data and the four-step schedule match the recurrent page.

### Two classes after the convolution

The batch is still 4, and the two batches alternate. The check split is evaluated once. Accuracy is again not a gate.

```numpy run expect="loss" title="Two classes after the convolution"
# four steps on the convolution
import minitorch as mt
import numpy as np
np.random.seed(0)
texts, labels, held, held_y = mt.sentiment_reviews()
vocab = sorted(set(" ".join(texts + held).split()))
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
conv = mt.nn.Conv2d(1, 4, (3, 8))
head = mt.nn.Linear(16, 2)
opt = mt.optim.SGD(emb.parameters() + conv.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    feat = conv(emb(pack(texts[start:start + 4])).reshape(4, 1, 6, 8)).reshape(4, -1)
    loss = mt.cross_entropy(head(feat), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(head(conv(emb(pack(held)).reshape(4, 1, 6, 8)).reshape(4, -1)), held_y)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### Flattening leaves 16

A sequence of length 6 with kernel height 3 leaves 4 positions in time. Four output channels times that 4 is 16.

```numpy run expect="flat 16" title="Flattening leaves 16"
# flattened convolution length
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((4, 1, 6, 8)))
y = mt.nn.Conv2d(1, 4, (3, 8))(x)
print("flat", int(np.prod(y.shape[1:])))
```

### The kernel width covers the whole embedding

The convolutional sentiment page does not slide inside each embedding dimension. The kernel width equals 8, so one application sees every coordinate of a word.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-cnn.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-cnn.html).
