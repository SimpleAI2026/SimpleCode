---
language: dl
chapter: 68
title: "Sequence to sequence"
level: beginner
minutes: 8
goals:
  - "Train on 16 short pairs"
  - "Show the decoder the target words"
  - "Check 8 pairs after four steps"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Sequence to sequence starts the decoder from the encoder's last state. So that four steps can finish, this page shows the decoder the target words and does not search.

### Four steps and one check

Each step takes 4 pairs. Four steps cover the 16 training pairs. The 8 check pairs run forward once.

```numpy run expect="loss" title="Four steps and one check"
# Start the decoder from the last state
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
dec = mt.nn.RNN(16, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + enc.parameters() + dec.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xs = src[step * 4:(step + 1) * 4]
    ys = tgt[step * 4:(step + 1) * 4]
    _, h = enc(emb(xs))
    out, _ = dec(emb(ys), h)
    loss = mt.cross_entropy(head(out.reshape(ys.shape[0] * 4, 16)), ys.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
xs = np.stack([encode(eng) for eng, _ in val])
ys = np.stack([encode(fra) for _, fra in val])
_, h = enc(emb(xs))
out, _ = dec(emb(ys), h)
acc = mt.accuracy(head(out.reshape(ys.shape[0] * 4, 16)), ys.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### The time length is 4

On a zero tensor the encoder's time axis is 4, matching the word count of each sentence.

```numpy run expect="steps 4" title="The time length is 4"
# It matches the word count
import minitorch as mt
import numpy as np
np.random.seed(0)
y, _ = mt.nn.RNN(4, 4)(mt.tensor(np.zeros((2, 4, 4))))
print("steps", y.shape[1])
```

### Search is not on this page

Sequence to sequence feeds the target words straight into the decoder, so there is no beam width. Beam search is demonstrated separately with fixed scores.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/seq2seq.html) and [en](https://d2l.ai/chapter_recurrent-modern/seq2seq.html).
