---
language: dl
chapter: 123
title: "掩码损失加下一句损失"
level: intermediate
minutes: 8
goals:
  - "同一批四句走四步"
  - "预测第二个词"
  - "第一位预测下一句标签"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

预训练把四句送进宽度 16 的一块编码器。第二个位置预测被遮住的词，第一个位置预测手写的下一句标签。两项交叉熵相加。四步都用这同一批。得不到能用的预训练模型。

### 两项损失一起走

词嵌入加上正弦位置，再进编码器。掩码目标是每句的第二个词。下一句目标是 0、1、0、1。

```numpy run expect="loss" title="两项损失一起走"
# 四句上的四步
import minitorch as mt
import numpy as np
np.random.seed(0)
lines = mt.bert_segments()
vocab = sorted(set(" ".join(lines).split()))
stoi = {w: i for i, w in enumerate(vocab)}
ids = []
for line in lines:
    ids.append([stoi[w] for w in line.split()])
x = np.array(ids)
width = 16
tok = mt.nn.Embedding(len(vocab), width)
block = mt.nn.EncoderBlock(width, 2, 32)
mlm = mt.nn.Linear(width, len(vocab))
nsp = mt.nn.Linear(width, 2)
params = tok.parameters() + block.parameters() + mlm.parameters() + nsp.parameters()
opt = mt.optim.SGD(params, lr=0.1)
masked = np.array([row[1] for row in ids])
nxt = np.array([0, 1, 0, 1])
last = 0.0
for step in range(4):
    opt.zero_grad()
    h = block(tok(x) + mt.tensor(mt.positional_encoding(6, width)))
    loss = mt.cross_entropy(mlm(h[:, 1, :]), masked) + mt.cross_entropy(nsp(h[:, 0, :]), nxt)
    loss.backward()
    opt.step()
    last = loss.item()
print("loss", round(last, 4))
```

### 头的宽度

掩码头的输出列数等于这四句的词表大小。下一句头固定是两列。这里用四句现场数词表。

```numpy run expect="heads" title="头的宽度"
# 两个头的列数
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
vocab = sorted(set(" ".join(lines).split()))
print("heads", len(vocab), 2)
```

### 四步不是预训练成品

预训练页的权重从随机数开始，句长只有 6，块也只有一块。打印损失只说明两项都能反传。

延伸阅读：[掩码损失加下一句损失](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert-pretraining.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/bert-pretraining.html)。
