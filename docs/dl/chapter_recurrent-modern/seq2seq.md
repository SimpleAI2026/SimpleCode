---
language: dl
chapter: 68
title: "序列到序列"
level: beginner
minutes: 8
goals:
  - "用 16 对短句训练"
  - "解码器直接看到目标词"
  - "四步之后检查 8 对"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

序列到序列用编码器的末状态启动解码器。为了让四步跑完，解码器这一页直接吃目标词，不另做搜索。

### 四步和一次检查

每步 4 对，一共四步，用完 16 对训练句。8 对检查句只前向一次。

```numpy run expect="loss" title="四步和一次检查"
# 末状态启动解码器
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

### 时间长度是 4

零张量上，编码器输出的时间维是 4，和每句的词数一致。

```numpy run expect="steps 4" title="时间长度是 4"
# 和词数一致
import minitorch as mt
import numpy as np
np.random.seed(0)
y, _ = mt.nn.RNN(4, 4)(mt.tensor(np.zeros((2, 4, 4))))
print("steps", y.shape[1])
```

### 搜索不在这一页

序列到序列把目标词直接送进解码器，所以没有束宽。束搜索单独用固定分数演示。

延伸阅读：[序列到序列](https://zh.d2l.ai/chapter_recurrent-modern/seq2seq.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/seq2seq.html)。
