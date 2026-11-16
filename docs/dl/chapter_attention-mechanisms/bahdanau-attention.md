---
language: dl
chapter: 74
title: "加性注意力"
level: intermediate
minutes: 8
goals:
  - "在解码的每一步看编码器"
  - "仍用那 16 对短句"
  - "四步之后检查 8 对"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

加性注意力让解码器的每一步都回看编码器的全部时间步。上下文和当前词拼在一起，所以解码器的输入宽度是 32。

### 四步和一次检查

每一步用隐藏状态和编码器输出做一次缩放点积，再把上下文送进解码器。学习率 0.1。

```numpy run expect="loss" title="四步和一次检查"
# 每步回看编码器
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

### 上下文的宽度

编码器隐藏宽度是 16，和词向量拼起来是 32。零输入上可以看见解码器吃进去的最后一维。

```numpy run expect="joined 32" title="上下文的宽度"
# 拼成 32
import minitorch as mt
import numpy as np
word = mt.tensor(np.zeros((2, 16)))
context = mt.tensor(np.zeros((2, 16)))
joined = mt.cat([word, context], axis=1)
print("joined", joined.shape[1])
```

### 宽度在这一页写明

加性注意力把解码器输入写成 32，时间长度仍是 4。四步结束时只保留 loss 和一次 acc。

延伸阅读：[加性注意力](https://zh.d2l.ai/chapter_attention-mechanisms/bahdanau-attention.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/bahdanau-attention.html)。
