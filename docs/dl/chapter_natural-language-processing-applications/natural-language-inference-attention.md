---
language: dl
chapter: 129
title: "假设看前提"
level: intermediate
minutes: 8
goals:
  - "查询是假设"
  - "键和值是前提"
  - "四步打三类"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

注意力推断页把每句截成六个词，嵌入宽度 8。假设是查询，前提是键和值。注意力输出在时间上取平均，再分三类。八对分成两批，四步轮流用。

### 三类交叉熵

四步的批量是 4。损失是三类交叉熵。这一页不另做检查集上的准确率。

```numpy run expect="loss" title="三类交叉熵"
# 注意力上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
left, right, labels, _vl, _vr, _vy = mt.nli_pairs()
vocab = sorted(set(" ".join(left + right).split()))
stoi = {w: i for i, w in enumerate(vocab)}

def pack(rows):
    table = []
    for line in rows:
        ids = [stoi[w] for w in line.split()]
        row = []
        i = 0
        while i < 6:
            row.append(ids[i] if i < len(ids) else 0)
            i += 1
        table.append(row)
    return np.array(table)

emb = mt.nn.Embedding(len(vocab), 8)
attn = mt.nn.MultiHeadAttention(8, 2)
head = mt.nn.Linear(8, 3)
opt = mt.optim.SGD(emb.parameters() + attn.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    query = emb(pack(right[start:start + 4]))
    memory = emb(pack(left[start:start + 4]))
    pooled = attn(query, memory, memory).mean(axis=1)
    loss = mt.cross_entropy(head(pooled), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 平均之后剩下宽度

注意力输出是 4 乘 6 乘 8。沿时间平均后是 4 乘 8，再交给线性层。

```numpy run expect="pool 4 8" title="平均之后剩下宽度"
# 平均后的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
q = mt.tensor(np.zeros((4, 6, 8)))
k = mt.tensor(np.zeros((4, 6, 8)))
y = mt.nn.MultiHeadAttention(8, 2)(q, k, k).mean(axis=1)
print("pool", y.shape[0], y.shape[1])
```

### 查询不和前提对调

注意力推断页固定用假设去看前提。它不双向各做一次，也不把外部句对库接进来。

延伸阅读：[假设看前提](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-attention.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-attention.html)。
