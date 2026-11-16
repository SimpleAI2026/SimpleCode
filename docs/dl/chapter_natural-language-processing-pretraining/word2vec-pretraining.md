---
language: dl
chapter: 117
title: "四步负采样"
level: intermediate
minutes: 8
goals:
  - "邻居只取左右各一个"
  - "每个正样本配一个负词"
  - "四步打印损失"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

预训练用前面的 32 行。每个中心词只连左边和右边。每个正对再抽一个负词。嵌入宽度是 8。四步，每步四个对。不看词向量好不好。

### 正损失加负损失

正样本的标签是 1，负样本的标签是 0。两项二元交叉熵相加。打印的是四步里的最后一次。

```numpy run expect="loss" title="正损失加负损失"
# 四步负采样
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
stoi = {w: i for i, w in enumerate(vocab)}
pairs = []
for line in rows:
    ids = [stoi[w] for w in line.split()]
    i = 0
    while i < len(ids):
        j = i - 1
        while j <= i + 1:
            if j != i and 0 <= j < len(ids):
                pairs.append((ids[i], ids[j]))
            j += 1
        i += 1
emb = mt.nn.Embedding(len(vocab), 8)
opt = mt.optim.SGD(emb.parameters(), lr=0.1)
rng = np.random.RandomState(0)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = pairs[step * 4:(step + 1) * 4]
    cen = np.array([p[0] for p in batch])
    ctx = np.array([p[1] for p in batch])
    neg = rng.randint(0, len(vocab), size=4)
    pos = (emb(cen) * emb(ctx)).sum(axis=1)
    bad = (emb(cen) * emb(neg)).sum(axis=1)
    loss = mt.bce_with_logits(pos, np.ones(4)) + mt.bce_with_logits(bad, np.zeros(4))
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 词表仍是 12

嵌入行是 12，列是 8。这一小段只看形状，不反传。

```numpy run expect="table 12 8" title="词表仍是 12"
# 嵌入表的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
table = mt.nn.Embedding(len(vocab), 8)
print("table", table.weight.shape[0], table.weight.shape[1])
```

### 一个负词就够这页

四步负采样不把每个正样本配五个负词，也不报告最近邻。损失能下降就说明反传走通了。

延伸阅读：[四步负采样](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word2vec-pretraining.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/word2vec-pretraining.html)。
