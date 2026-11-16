---
language: dl
chapter: 77
title: "Transformer"
level: intermediate
minutes: 8
goals:
  - "Set the width to 16 and keep one block"
  - "Add a position encoding of length 4"
  - "Take four steps on the excerpt"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The transformer here is one block: multi-head self-attention, layer norm, then one linear layer. The width is 16, narrower than a usual stack, and the time length is 4.

### Four steps and one check

The position encoding is added to the embedding along time. The four steps still use windows from that short synthetic text, and 8 windows are checked once.

```numpy run expect="loss" title="Four steps and one check"
# One block, width 16
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
class Block(mt.nn.Module):
    def __init__(self):
        self.attn = mt.nn.MultiHeadAttention(16, 2)
        self.norm = mt.nn.LayerNorm(16)
        self.ff = mt.nn.Linear(16, 16)
    def forward(self, tokens):
        h = self.norm(tokens + self.attn(tokens, tokens, tokens))
        return h + self.ff(h).relu()
block = Block()
pe = mt.tensor(mt.positional_encoding(4, 16))
head = mt.nn.Linear(16, width)
params = emb.parameters() + block.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out = block(emb(x) + pe)
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out = block(emb(x) + pe)
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The shape after one block

A zero input plus the position encoding goes through the block, and batch, time, and width stay 2, 4, and 16.

```numpy run expect="shape 2 4 16" title="The shape after one block"
# One block only
import minitorch as mt
import numpy as np
np.random.seed(0)
class Block(mt.nn.Module):
    def __init__(self):
        self.attn = mt.nn.MultiHeadAttention(16, 2)
        self.norm = mt.nn.LayerNorm(16)
        self.ff = mt.nn.Linear(16, 16)
    def forward(self, tokens):
        h = self.norm(tokens + self.attn(tokens, tokens, tokens))
        return h + self.ff(h).relu()
x = mt.tensor(np.zeros((2, 4, 16)))
pe = mt.tensor(mt.positional_encoding(4, 16))
y = Block()(x + pe)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### The narrow model stops here

This transformer page states width 16, one block, and four steps. It does not stack further layers, and it ends when loss is printed.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/transformer.html) and [en](https://d2l.ai/chapter_attention-mechanisms/transformer.html).
