---
language: dl
chapter: 130
title: "随机编码器上的分类头"
level: intermediate
minutes: 8
goals:
  - "只取四条短评"
  - "正负各两条"
  - "四步重复这一批"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

微调这页不加载任何已经训过的编码器。它自己初始化宽度 16 的一块，取短评里的第 1、2、5、6 条，标签是两个正面和两个负面。四步都用这四条。分类读第一个位置。

### 第一个位置的两类

词嵌入加上位置编码，经过一块编码器。损失是两类交叉熵。学习率 0.05。

```numpy run expect="loss" title="第一个位置的两类"
# 四条短评上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
texts, labels, _held, _held_y = mt.sentiment_reviews()
chosen = [texts[0], texts[1], texts[4], texts[5]]
y = np.array([labels[0], labels[1], labels[4], labels[5]])
vocab = sorted(set(" ".join(chosen).split()))
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
head = mt.nn.Linear(width, 2)
opt = mt.optim.SGD(tok.parameters() + block.parameters() + head.parameters(), lr=0.05)
x = pack(chosen)
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(head(h[:, 0, :]), y)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 这四条的标签和

选中的四条标签之和是 2，说明正面和负面各半。这一小段不训练。

```numpy run expect="half 2 4" title="这四条的标签和"
# 四条标签之和
import minitorch as mt
import numpy as np
_texts, labels, _held, _held_y = mt.sentiment_reviews()
picked = np.array([labels[0], labels[1], labels[4], labels[5]])
print("half", int(picked.sum()), picked.shape[0])
```

### 没有可加载的成品权重

微调页的编码器从均匀随机数开始。四步之后它仍然只见过四条短评，不能当成情感模型来用。

延伸阅读：[随机编码器上的分类头](https://zh.d2l.ai/chapter_natural-language-processing-applications/finetuning-bert.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/finetuning-bert.html)。
