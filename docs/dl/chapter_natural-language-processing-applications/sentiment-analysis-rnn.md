---
language: dl
chapter: 126
title: "短评上的循环层"
level: intermediate
minutes: 8
goals:
  - "八条分成两批"
  - "用最后一步的隐藏状态"
  - "打印损失和一次准确率"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

循环情感页把每条短评截成六个词，嵌成宽度 8，再进隐藏宽度 8 的循环层。分类用最后一个时间步。四步里两批各用两次。检查四条只评估一次。准确率不是门槛。

### 最后一步的两类

损失是两类交叉熵。准确率用检查集的四条，标签里两个正面。数字只说明评估跑过。

```numpy run expect="loss" title="最后一步的两类"
# 循环层上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
texts, labels, held, held_y = mt.sentiment_reviews()
vocab = sorted(set(" ".join(texts + held).split()))
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
rnn = mt.nn.RNN(8, 8)
head = mt.nn.Linear(8, 2)
opt = mt.optim.SGD(emb.parameters() + rnn.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    out, _state = rnn(emb(pack(texts[start:start + 4])))
    loss = mt.cross_entropy(head(out[:, -1, :]), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
held_out, _state = rnn(emb(pack(held)))
acc = mt.accuracy(head(held_out[:, -1, :]), held_y)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 隐藏宽度是 8

一条长度为 6、宽度为 8 的输入，循环层输出仍是长度 6、宽度 8。分类只取最后一列。

```numpy run expect="steps 6 8" title="隐藏宽度是 8"
# 循环输出的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(8, 8)
y, _state = cell(mt.tensor(np.zeros((4, 6, 8))))
print("steps", y.shape[1], y.shape[2])
```

### 两批轮流不是更多数据

循环情感页只有八条训练句，所以四步必须重复这两批。它不扩充成影评那么多句。

延伸阅读：[短评上的循环层](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-rnn.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-rnn.html)。
