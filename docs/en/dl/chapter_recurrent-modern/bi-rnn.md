---
language: dl
chapter: 65
title: "A bidirectional recurrent net"
level: beginner
minutes: 8
goals:
  - "Run forward and then backward"
  - "Join the two outputs on the last axis"
  - "Give the linear layer a width of 32"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

A bidirectional net reads reversed time with a second RNN. The two hidden vectors are joined, so the linear layer sees 32 rather than 16.

### Four steps and one check

The backward result is flipped again so its time lines up with the forward result. Batch, steps, and the check count stay the same.

```numpy run expect="loss" title="Four steps and one check"
# Forward plus backward
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
fwd = mt.nn.RNN(16, 16)
bwd = mt.nn.RNN(16, 16)
head = mt.nn.Linear(32, width)
params = emb.parameters() + fwd.parameters() + bwd.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    hidden = emb(x)
    left, _ = fwd(hidden)
    right, _ = bwd(mt.flip_time(hidden))
    out = mt.cat([left, mt.flip_time(right)], axis=2)
    loss = mt.cross_entropy(head(out.reshape(16, 32)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
hidden = emb(x)
left, _ = fwd(hidden)
right, _ = bwd(mt.flip_time(hidden))
out = mt.cat([left, mt.flip_time(right)], axis=2)
acc = mt.accuracy(head(out.reshape(32, 32)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The width after joining

Each direction has width 8, and joining them makes 16. A zero input shows that width directly.

```numpy run expect="shape 2 4 16" title="The width after joining"
# Join the last axis
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((2, 4, 4)))
left, _ = mt.nn.RNN(4, 8)(x)
right, _ = mt.nn.RNN(4, 8)(mt.flip_time(x))
y = mt.cat([left, mt.flip_time(right)], axis=2)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### Backward is not a second layer

Both directions read the same input and differ only in time order. After four steps on this bidirectional page, the linear layer eats the joined vector.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/bi-rnn.html) and [en](https://d2l.ai/chapter_recurrent-modern/bi-rnn.html).
