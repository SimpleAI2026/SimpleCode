---
language: dl
chapter: 63
title: "长短期记忆"
level: beginner
minutes: 8
goals:
  - "分开输入门、遗忘门和输出门"
  - "细胞状态和隐藏状态一起传"
  - "四步之后做一次检查"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

LSTM 比 GRU 多一条细胞状态。遗忘门作用在细胞上，输出门再决定隐藏状态露出多少。

### 四步和一次检查

返回值是输出和一对状态。训练只用输出去预测下一个词。

```numpy run expect="loss" title="四步和一次检查"
# 带细胞状态
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
rnn = mt.nn.LSTM(16, 16)
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

### 隐藏状态的形状

状态是一对张量。打印时取隐藏那一条，批量 2、宽度 8。

```numpy run expect="state 2 8" title="隐藏状态的形状"
# 取出隐藏状态
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.LSTM(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### 细胞状态不直接当输出

输出仍然是每个时间步的隐藏向量。LSTM 这一页不比较门的个数，只把四步的 loss 留下来。

延伸阅读：[长短期记忆](https://zh.d2l.ai/chapter_recurrent-modern/lstm.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/lstm.html)。
