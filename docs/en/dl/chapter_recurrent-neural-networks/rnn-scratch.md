---
language: dl
chapter: 58
title: "From scratch"
level: beginner
minutes: 8
goals:
  - "Unroll four steps with matrices"
  - "Clip gradients by the global norm"
  - "Update four times on 32 windows"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The scratch version writes the hidden recurrence in a loop. The hidden width is 16, each step sees 4 windows of length 4, and a global gradient norm above 1 is scaled down.

### Four steps and one check

The learning rate is 0.1. After four steps, 8 check windows run forward once and acc is printed.

```numpy run expect="loss" title="Four steps and one check"
# A handwritten unroll
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
scale = 0.25
W_xh = mt.tensor(np.random.uniform(-scale, scale, (16, 16)), requires_grad=True)
W_hh = mt.tensor(np.random.uniform(-scale, scale, (16, 16)), requires_grad=True)
b_h = mt.tensor(np.zeros(16), requires_grad=True)
def unroll(token_batch):
    h = mt.tensor(np.zeros((token_batch.shape[0], 16)))
    outs = []
    for t in range(4):
        h = (token_batch[:, t, :] @ W_xh.T + h @ W_hh.T + b_h).tanh()
        outs.append(h.reshape(token_batch.shape[0], 1, 16))
    return mt.cat(outs, axis=1)
head = mt.nn.Linear(16, width)
params = [W_xh, W_hh, b_h] + emb.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out = unroll(emb(x))
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out = unroll(emb(x))
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The output is still batch by time

Without an embedding, 4 features go in and 8 hidden units come out, and the time length stays 4.

```numpy run expect="shape 2 4 8" title="The output is still batch by time"
# A zero input
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### Clipping happens before the update

The scratch page puts clip_grad between backward and step, with a cap of 1. Its four steps stop at the printed loss.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn-scratch.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/rnn-scratch.html).
