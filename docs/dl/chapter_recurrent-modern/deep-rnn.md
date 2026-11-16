---
language: dl
chapter: 64
title: "深层循环网络"
level: beginner
minutes: 8
goals:
  - "把两层 RNN 叠起来"
  - "第二层吃第一层的输出"
  - "宽度保持 16"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

深层网络这里只叠两层。第一层的每个时间步输出，原样成为第二层的输入。两层的隐藏宽度都是 16。

### 四步和一次检查

线性层接在第二层后面。四步的安排和单层那一页一样。

```numpy run expect="loss" title="四步和一次检查"
# 两层
import minitorch as mt
import numpy as np
np.random.seed(0)
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
vocab = sorted(set(words))
stoi = {w: i for i, w in enumerate(vocab)}
ids = np.array([stoi[w] for w in words], dtype=np.int64)
windows = []
for start in range(0, len(ids) - 4):
    windows.append(ids[start:start + 5])
    if len(windows) == 40:
        break
train = windows[:32]
val = windows[32:40]
width = len(vocab)
emb = mt.nn.Embedding(width, 16)
lower = mt.nn.RNN(16, 16)
upper = mt.nn.RNN(16, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + lower.parameters() + upper.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    mid, _ = lower(emb(x))
    out, _ = upper(mid)
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
mid, _ = lower(emb(x))
out, _ = upper(mid)
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 第二层的形状

零输入经过两层之后仍是 2 乘 4 乘 8。层数不改变时间长度。

```numpy run expect="shape 2 4 8" title="第二层的形状"
# 叠两层
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((2, 4, 4)))
mid, _ = mt.nn.RNN(4, 8)(x)
y, _ = mt.nn.RNN(8, 8)(mid)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 只演示两层

书里可以叠得更深。这一页把层数写成 2，并在四步之后停下。深层循环网络就到这里。

延伸阅读：[深层循环网络](https://zh.d2l.ai/chapter_recurrent-modern/deep-rnn.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/deep-rnn.html)。
