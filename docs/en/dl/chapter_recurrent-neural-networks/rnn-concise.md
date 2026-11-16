---
language: dl
chapter: 59
title: "A concise recurrent layer"
level: beginner
minutes: 8
goals:
  - "Switch to the RNN module"
  - "Still take only four steps"
  - "Check an output of 2 by 4 by 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The concise page puts the same tanh recurrence inside RNN. The input is still a 3-D tensor with the batch on the outside, and the training schedule matches the previous page.

### Four steps and one check

An embedding, an RNN, and a linear layer are chained. The training batch is 4 and the check batch is 8.

```numpy run expect="loss" title="Four steps and one check"
# The module cell
import minitorch as mt
import numpy as np
np.random.seed(0)
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
train = windows[:32]
val = windows[32:40]
width = len(vocab)
emb = mt.nn.Embedding(width, 16)
rnn = mt.nn.RNN(16, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + rnn.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out, _ = rnn(emb(x))
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out, _ = rnn(emb(x))
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The shape on zeros

Two samples, four time steps, and four features, with a hidden width of 8. The last axis is that width.

```numpy run expect="shape 2 4 8" title="The shape on zeros"
# Shape only
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### It is the same recurrence as the loop

The concise page does not change the formula. It only stops writing the time loop by hand. The four steps on this recurrent-layer page also look only at loss.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn-concise.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/rnn-concise.html).
