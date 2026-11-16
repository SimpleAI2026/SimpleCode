---
language: dl
chapter: 127
title: "三个词的卷积"
level: intermediate
minutes: 8
goals:
  - "核高是 3，核宽等于嵌入"
  - "四步仍用那八条"
  - "打印损失和一次准确率"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

卷积情感页把六个词的嵌入排成 1 乘 6 乘 8，用高 3、宽 8 的卷积一次看三个词。输出再铺平，接到两类。数据和四步的安排与循环页相同。

### 卷积后的两类

四步的批量仍是 4，两批轮流。检查集评估一次。准确率同样不作门槛。

```numpy run expect="loss" title="卷积后的两类"
# 卷积上的四步
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
conv = mt.nn.Conv2d(1, 4, (3, 8))
head = mt.nn.Linear(16, 2)
opt = mt.optim.SGD(emb.parameters() + conv.parameters() + head.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    start = (step % 2) * 4
    feat = conv(emb(pack(texts[start:start + 4])).reshape(4, 1, 6, 8)).reshape(4, -1)
    loss = mt.cross_entropy(head(feat), labels[start:start + 4])
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(head(conv(emb(pack(held)).reshape(4, 1, 6, 8)).reshape(4, -1)), held_y)
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 铺平之后是 16

长度 6 的序列，核高 3，时间方向剩下 4。四个输出通道乘上这 4，是 16。

```numpy run expect="flat 16" title="铺平之后是 16"
# 卷积铺平的长度
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((4, 1, 6, 8)))
y = mt.nn.Conv2d(1, 4, (3, 8))(x)
print("flat", int(np.prod(y.shape[1:])))
```

### 核宽盖住整个嵌入

卷积情感页不在嵌入的每个维度上单独滑动。核的宽度等于 8，所以一次就看完一个词的全部坐标。

延伸阅读：[三个词的卷积](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-cnn.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-cnn.html)。
