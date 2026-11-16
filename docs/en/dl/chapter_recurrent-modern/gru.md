---
language: dl
chapter: 62
title: "Gated recurrent unit"
level: beginner
minutes: 8
goals:
  - "Use a reset gate and an update gate"
  - "Take four steps on the same text"
  - "Check the shape 2 by 4 by 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A GRU uses a reset gate for how much old state to forget, and an update gate to mix the old state with a new candidate. Width and time stay 16 and 4.

### Four steps and one check

The windows match the recurrent-network page. The cell is now a GRU, and the learning rate is still 0.1.

```numpy run expect="loss" title="Four steps and one check"
# A gated cell
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
rnn = mt.nn.GRU(16, 16)
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

### The output shape does not change

Two samples walk four time steps with a hidden width of 8. The gates do not change that three-axis layout.

```numpy run expect="shape 2 4 8" title="The output shape does not change"
# A zero input
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.GRU(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### The candidate sits between the gates

When the update gate is near 1, the new candidate barely enters the hidden state. The four steps on this GRU page only have to print loss.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/gru.html) and [en](https://d2l.ai/chapter_recurrent-modern/gru.html).
