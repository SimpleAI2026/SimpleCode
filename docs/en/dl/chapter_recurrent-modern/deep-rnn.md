---
language: dl
chapter: 64
title: "A deep recurrent net"
level: beginner
minutes: 8
goals:
  - "Stack two RNN layers"
  - "Feed the first output into the second"
  - "Keep the width at 16"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The deep net here stacks only two layers. Each time step from the first layer becomes the input of the second. Both hidden widths are 16.

### Four steps and one check

The linear layer sits after the second layer. The four-step schedule matches the single-layer page.

```numpy run expect="loss" title="Four steps and one check"
# Two layers
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
lower = mt.nn.RNN(16, 16)
upper = mt.nn.RNN(16, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + lower.parameters() + upper.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    mid, _ = lower(emb(x))
    out, _ = upper(mid)
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
mid, _ = lower(emb(x))
out, _ = upper(mid)
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The second layer's shape

After two layers a zero input is still 2 by 4 by 8. The layer count does not change the time length.

```numpy run expect="shape 2 4 8" title="The second layer's shape"
# Stack two layers
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((2, 4, 4)))
mid, _ = mt.nn.RNN(4, 8)(x)
y, _ = mt.nn.RNN(8, 8)(mid)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### Only two layers are shown

A published stack can go deeper. This page sets the depth to 2 and stops after four steps. The deep recurrent net ends here.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/deep-rnn.html) and [en](https://d2l.ai/chapter_recurrent-modern/deep-rnn.html).
