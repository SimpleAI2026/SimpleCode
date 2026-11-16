---
language: dl
chapter: 63
title: "Long short-term memory"
level: beginner
minutes: 8
goals:
  - "Split input, forget, and output gates"
  - "Carry both cell state and hidden state"
  - "Check once after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

An LSTM adds a cell state beside the hidden state. The forget gate acts on the cell, and the output gate decides how much of it becomes the hidden state.

### Four steps and one check

The return value is the output plus a pair of states. Training uses only the output to predict the next word.

```numpy run expect="loss" title="Four steps and one check"
# With a cell state
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
rnn = mt.nn.LSTM(16, 16)
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

### The hidden-state shape

The state is a pair of tensors. The print takes the hidden one: batch 2 and width 8.

```numpy run expect="state 2 8" title="The hidden-state shape"
# Take the hidden state
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.LSTM(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### The cell state is not the output

The output is still the hidden vector at each time step. This LSTM page does not compare gate counts. It keeps the four-step loss.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/lstm.html) and [en](https://d2l.ai/chapter_recurrent-modern/lstm.html).
