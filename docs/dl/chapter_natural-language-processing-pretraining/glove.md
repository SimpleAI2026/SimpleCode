---
language: dl
chapter: 118
title: "共现上的四步"
level: intermediate
minutes: 8
goals:
  - "用同一 32 行数邻居"
  - "拟合对数次数"
  - "不下载现成向量"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

全局向量这页不下载几十兆的向量文件。它在同一 32 行上数左右邻居，得到共现次数，再让两个词向量的点积去靠近次数的对数。四步，每步四个非零格子。

### 平方差对着对数

预测是点积加上两个偏置。目标是共现次数的对数。损失是差的平方的平均。

```numpy run expect="loss" title="平方差对着对数"
# 共现上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
stoi = {w: i for i, w in enumerate(vocab)}
co = np.zeros((len(vocab), len(vocab)))
for line in rows:
    ids = [stoi[w] for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                co[ids[i], ids[j]] += 1
            j += 1
        i += 1
nz = np.argwhere(co > 0)
emb = mt.nn.Embedding(len(vocab), 8)
bi = mt.tensor(np.zeros(len(vocab)), requires_grad=True)
bj = mt.tensor(np.zeros(len(vocab)), requires_grad=True)
opt = mt.optim.SGD(emb.parameters() + [bi, bj], lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = nz[step * 4:(step + 1) * 4]
    ii = batch[:, 0]
    jj = batch[:, 1]
    dot = (emb(ii) * emb(jj)).sum(axis=1)
    pred = dot + bi[ii] + bj[jj]
    diff = pred - mt.tensor(np.log(co[ii, jj]))
    loss = (diff * diff).mean()
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 非零格子够四步

十二乘十二的表里，大于零的格子远多于 16。四步只取按扫描顺序排在前面的 16 个。

```numpy run expect="cells 129" title="非零格子够四步"
# 非零共现格子
import minitorch as mt
import numpy as np
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
co = np.zeros((len(vocab), len(vocab)))
for line in rows:
    ids = [vocab.index(w) for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                co[ids[i], ids[j]] += 1
            j += 1
        i += 1
print("cells", int((co > 0).sum()))
```

### 没有加权函数的整张表

共现这页不按次数给每个格子再乘一个饱和权重，也不把偏置存成对外发布的向量。四步只核对平方损失。

延伸阅读：[共现上的四步](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/glove.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/glove.html)。
