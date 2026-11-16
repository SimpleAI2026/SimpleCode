---
language: dl
chapter: 120
title: "四步之后的余弦"
level: intermediate
minutes: 8
goals:
  - "先把负采样走四步"
  - "再读两个词向量的余弦"
  - "不拿外部向量做类比"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

相似性这页用和负采样相同的四步，得到一张 12 乘 8 的表。然后只打印第 0 行和第 1 行的余弦。这个数不代表词义关系，因为句子是抽出来的。

### 损失旁边的余弦

四步的安排和负采样页相同。余弦用第 0 个词和第 1 个词，分母加了一个很小的数，避免长度为 0。

```numpy run expect="loss" title="损失旁边的余弦"
# 四步后的余弦
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
a = emb.weight.data[0]
b = emb.weight.data[1]
cos = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
print("loss", round(last, 4), "cos", round(cos, 4))
```

### 垂直的两个方向

手写的 (1, 0) 和 (0, 1) 余弦是 0。这只说明公式，不使用上面训出来的表。

```numpy run expect="cos 0.0" title="垂直的两个方向"
# 两个垂直向量
import minitorch as mt
import numpy as np
a = np.array([1.0, 0.0])
b = np.array([0.0, 1.0])
cos = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
print("cos", round(cos, 1))
```

### 不做国王和王后那种类比

相似性页不从外部向量里做加减类比。四步之后的余弦只说明两个随机起点被推过一次。

延伸阅读：[四步之后的余弦](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/similarity-analogy.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/similarity-analogy.html)。
