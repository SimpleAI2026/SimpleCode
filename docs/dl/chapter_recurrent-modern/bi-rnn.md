---
language: dl
chapter: 65
title: "双向循环网络"
level: beginner
minutes: 8
goals:
  - "正向走一遍再反向走一遍"
  - "在最后一维拼起来"
  - "线性层的输入宽度是 32"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

双向网络用第二个 RNN 读反转后的时间。两路隐藏向量拼在一起，所以线性层的输入是 32 而不是 16。

### 四步和一次检查

反向结果要再翻回来，时间才和正向对齐。其余的批量、步数和检查条数不变。

```numpy run expect="loss" title="四步和一次检查"
# 正向加反向
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
fwd = mt.nn.RNN(16, 16)
bwd = mt.nn.RNN(16, 16)
head = mt.nn.Linear(32, width)
params = emb.parameters() + fwd.parameters() + bwd.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    hidden = emb(x)
    left, _ = fwd(hidden)
    right, _ = bwd(mt.flip_time(hidden))
    out = mt.cat([left, mt.flip_time(right)], axis=2)
    loss = mt.cross_entropy(head(out.reshape(16, 32)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
hidden = emb(x)
left, _ = fwd(hidden)
right, _ = bwd(mt.flip_time(hidden))
out = mt.cat([left, mt.flip_time(right)], axis=2)
acc = mt.accuracy(head(out.reshape(32, 32)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 拼接之后的宽度

两路隐藏都是 8，拼起来是 16。零输入上可以直接看见这个宽度。

```numpy run expect="shape 2 4 16" title="拼接之后的宽度"
# 最后一维拼接
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((2, 4, 4)))
left, _ = mt.nn.RNN(4, 8)(x)
right, _ = mt.nn.RNN(4, 8)(mt.flip_time(x))
y = mt.cat([left, mt.flip_time(right)], axis=2)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 反向不是第二层

两路读的是同一层输入，只是时间方向相反。双向这一页的四步结束后，线性层吃的是拼好的向量。

延伸阅读：[双向循环网络](https://zh.d2l.ai/chapter_recurrent-modern/bi-rnn.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/bi-rnn.html)。
