---
language: dl
chapter: 62
title: "门控循环单元"
level: beginner
minutes: 8
goals:
  - "用重置门和更新门"
  - "在同一文本上走四步"
  - "核对形状 2 乘 4 乘 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

GRU 用重置门决定要忘掉多少旧状态，用更新门把旧状态和新候选混在一起。宽度和时间长度仍是 16 和 4。

### 四步和一次检查

数据窗口和循环网络那一页相同。单元换成 GRU，学习率仍是 0.1。

```numpy run expect="loss" title="四步和一次检查"
# 门控单元
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
rnn = mt.nn.GRU(16, 16)
head = mt.nn.Linear(16, width)
params = emb.parameters() + rnn.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out, _ = rnn(emb(x))
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out, _ = rnn(emb(x))
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 输出形状不变

两条样本走过四个时间步，隐藏宽度 8。门控不改变这三维的摆法。

```numpy run expect="shape 2 4 8" title="输出形状不变"
# 零输入
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.GRU(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### 候选状态被夹在门之间

更新门接近 1 时新候选几乎不进入隐藏状态。GRU 这一页的四步只负责把 loss 打出来。

延伸阅读：[门控循环单元](https://zh.d2l.ai/chapter_recurrent-modern/gru.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/gru.html)。
