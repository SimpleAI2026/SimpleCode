---
language: dl
chapter: 74
title: "Additive attention"
level: intermediate
minutes: 8
goals:
  - "Look at the encoder on every decoder step"
  - "Keep using the 16 short pairs"
  - "Check 8 pairs after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Additive attention lets every decoder step look back at all encoder time steps. The context is joined with the current word, so the decoder input width is 32.

### Four steps and one check

Each step scores the hidden state against the encoder output with a scaled dot product, then feeds the context into the decoder. The learning rate is 0.1.

```numpy run expect="loss" title="Four steps and one check"
# Look back at the encoder each step
import minitorch as mt
import numpy as np
np.random.seed(0)
train, val = mt.datasets.translation_pairs()
rows = train + val
words = []
for eng, fra in rows:
    words.extend(eng.split())
    words.extend(fra.split())
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
def encode(text):
    return np.array([stoi[w] for w in text.split()], dtype=np.int64)
src = np.stack([encode(eng) for eng, _ in train])
tgt = np.stack([encode(fra) for _, fra in train])
width = len(vocab)
emb = mt.nn.Embedding(width, 16)
enc = mt.nn.RNN(16, 16)
dec = mt.nn.RNN(32, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + enc.parameters() + dec.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xs = src[step * 4:(step + 1) * 4]
    ys = tgt[step * 4:(step + 1) * 4]
    enc_out, h = enc(emb(xs))
    dec_in = emb(ys)
    parts = []
    for t in range(4):
        scores = (h.reshape(h.shape[0], 1, 16) @ enc_out.transpose()).reshape(h.shape[0], 4) / 4.0
        weights = mt.softmax_last(scores)
        context = (weights.reshape(h.shape[0], 1, 4) @ enc_out).reshape(h.shape[0], 16)
        xt = mt.cat([dec_in[:, t, :], context], axis=1).reshape(h.shape[0], 1, 32)
        y, h = dec(xt, h)
        parts.append(y)
    out = mt.cat(parts, axis=1)
    loss = mt.cross_entropy(head(out.reshape(ys.shape[0] * 4, 16)), ys.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
xs = np.stack([encode(eng) for eng, _ in val])
ys = np.stack([encode(fra) for _, fra in val])
enc_out, h = enc(emb(xs))
dec_in = emb(ys)
parts = []
for t in range(4):
    scores = (h.reshape(h.shape[0], 1, 16) @ enc_out.transpose()).reshape(h.shape[0], 4) / 4.0
    weights = mt.softmax_last(scores)
    context = (weights.reshape(h.shape[0], 1, 4) @ enc_out).reshape(h.shape[0], 16)
    xt = mt.cat([dec_in[:, t, :], context], axis=1).reshape(h.shape[0], 1, 32)
    y, h = dec(xt, h)
    parts.append(y)
out = mt.cat(parts, axis=1)
acc = mt.accuracy(head(out.reshape(ys.shape[0] * 4, 16)), ys.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The context width

The encoder hidden width is 16, and joining it with the word vector makes 32. A zero input shows the last axis the decoder consumes.

```numpy run expect="joined 32" title="The context width"
# Joined to 32
import minitorch as mt
import numpy as np
word = mt.tensor(np.zeros((2, 16)))
context = mt.tensor(np.zeros((2, 16)))
joined = mt.cat([word, context], axis=1)
print("joined", joined.shape[1])
```

### The width is stated on this page

Additive attention sets the decoder input to 32, and the time length stays 4. At the end of four steps it keeps loss and one acc.

Pages: [zh](https://zh.d2l.ai/chapter_attention-mechanisms/bahdanau-attention.html) and [en](https://d2l.ai/chapter_attention-mechanisms/bahdanau-attention.html).
