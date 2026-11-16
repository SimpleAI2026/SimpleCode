---
language: dl
chapter: 131
title: "句对上的随机编码器"
level: intermediate
minutes: 8
goals:
  - "只用前四对"
  - "读假设那一侧"
  - "三类头走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

句对微调另起一块宽度 16 的编码器，不共用上一页的权重。它只取前四对，并把假设截成六个词送进去。三类标签是这四对自带的 0、0、1、2。四步重复这一批。

### 假设一侧的三类

缩短之后，送进编码器的是假设而不是两句拼在一起。损失仍是三类交叉熵。学习率 0.05。

```numpy run expect="loss" title="假设一侧的三类"
# 四对上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
left, right, labels, _vl, _vr, _vy = mt.nli_pairs()
left, right, labels = left[:4], right[:4], labels[:4]
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

width = 16
tok = mt.nn.Embedding(len(vocab), width)
block = mt.nn.EncoderBlock(width, 2, 32)
head = mt.nn.Linear(width, 3)
opt = mt.optim.SGD(tok.parameters() + block.parameters() + head.parameters(), lr=0.05)
x = pack(right)
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(head(h[:, 0, :]), labels)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 前四对的标签

前四个标签是 0、0、1、2。三类都碰得到。这一小段只打印，不反传。

```numpy run expect="four 0 0 1 2" title="前四对的标签"
# 前四个标签
import minitorch as mt
import numpy as np
_left, _right, labels, _vl, _vr, _vy = mt.nli_pairs()
print("four", int(labels[0]), int(labels[1]), int(labels[2]), int(labels[3]))
```

### 假设单独进入编码器

句对微调这页没有把前提和假设拼成一条更长的序列。前提留在数据里，用来说明这对句子从哪来，不参加这四步的前向。

延伸阅读：[句对上的随机编码器](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-bert.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-bert.html)。
