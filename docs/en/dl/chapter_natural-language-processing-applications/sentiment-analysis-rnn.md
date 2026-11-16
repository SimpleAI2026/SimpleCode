---
language: dl
chapter: 126
title: "A recurrent layer on the reviews"
level: intermediate
minutes: 8
goals:
  - "Split eight lines into two batches"
  - "Use the hidden state at the last step"
  - "Print the loss and one accuracy"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The recurrent sentiment page clips each review to six words, embeds them at width 8, and runs a recurrent layer of hidden width 8. The class uses the last time step. Across four steps the two batches are each used twice. The four check lines are evaluated once. Accuracy is not a gate.

### Two classes from the last step

The loss is two-class cross-entropy. Accuracy uses the four check lines, which contain two positives. The number only shows that the evaluation ran.

```numpy run expect="loss" title="Two classes from the last step"
# four steps on the recurrent layer
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
rnn = mt.nn.RNN(8, 8)
head = mt.nn.Linear(8, 2)
opt = mt.optim.SGD(emb.parameters() + rnn.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    out, _state = rnn(emb(pack(texts[start:start + 4])))
    loss = mt.cross_entropy(head(out[:, -1, :]), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
held_out, _state = rnn(emb(pack(held)))
acc = mt.accuracy(head(held_out[:, -1, :]), held_y)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The hidden width is 8

An input of length 6 and width 8 still has length 6 and width 8 after the recurrent layer. The classifier takes only the last step.

```numpy run expect="steps 6 8" title="The hidden width is 8"
# recurrent output shape
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(8, 8)
y, _state = cell(mt.tensor(np.zeros((4, 6, 8))))
print("steps", y.shape[1], y.shape[2])
```

### Alternating two batches is not more data

The recurrent sentiment page has only eight training lines, so four steps have to repeat those two batches. It does not grow into a movie-review collection.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-rnn.html) and [en](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-rnn.html).
