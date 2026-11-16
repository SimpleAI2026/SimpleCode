---
language: dl
chapter: 58
title: "从零实现"
level: beginner
minutes: 8
goals:
  - "用矩阵自己展开四步"
  - "梯度按全局范数截断"
  - "在 32 条窗口上更新四次"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

从零实现把隐藏递推写在循环里。隐藏宽度 16，每次看 4 条长度为 4 的窗口，梯度的全局范数超过 1 就缩小。

### 四步和一次检查

学习率 0.1。四步之后，8 条检查窗口只前向一次，并打印 acc。

```numpy run expect="loss" title="四步和一次检查"
# 手写展开
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
scale = 0.25
W_xh = mt.tensor(np.random.uniform(-scale, scale, (16, 16)), requires_grad=True)
W_hh = mt.tensor(np.random.uniform(-scale, scale, (16, 16)), requires_grad=True)
b_h = mt.tensor(np.zeros(16), requires_grad=True)
def unroll(token_batch):
    h = mt.tensor(np.zeros((token_batch.shape[0], 16)))
    outs = []
    for t in range(4):
        h = (token_batch[:, t, :] @ W_xh.T + h @ W_hh.T + b_h).tanh()
        outs.append(h.reshape(token_batch.shape[0], 1, 16))
    return mt.cat(outs, axis=1)
head = mt.nn.Linear(16, width)
params = [W_xh, W_hh, b_h] + emb.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out = unroll(emb(x))
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out = unroll(emb(x))
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 输出仍是批量乘时间

不经过词嵌入时，4 个特征进、8 个隐藏出，时间长度保持 4。

```numpy run expect="shape 2 4 8" title="输出仍是批量乘时间"
# 零输入
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### 截断写在更新之前

从零实现把 clip_grad 放在 backward 和 step 之间，上限是 1。这一页的四步就停在打印出的 loss 上。

延伸阅读：[从零实现](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn-scratch.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/rnn-scratch.html)。
