---
language: dl
chapter: 59
title: "简洁实现"
level: beginner
minutes: 8
goals:
  - "改用 RNN 模块"
  - "仍然只走四步"
  - "核对输出是 2 乘 4 乘 8"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

简洁实现把同一个 tanh 递推放进 RNN。输入仍是批量在外的三维张量，训练安排和上一页相同。

### 四步和一次检查

嵌入、RNN 和线性层串起来。四步的批量是 4，检查批量是 8。

```numpy run expect="loss" title="四步和一次检查"
# 模块版的单元
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
rnn = mt.nn.RNN(16, 16)
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

### 零输入的形状

两条样本、四个时间步、四个特征，隐藏宽度 8。最后一维就是隐藏宽度。

```numpy run expect="shape 2 4 8" title="零输入的形状"
# 只看形状
import minitorch as mt
import numpy as np
np.random.seed(0)
cell = mt.nn.RNN(4, 8)
y, state = cell(mt.tensor(np.zeros((2, 4, 4))))
hidden = state[0] if isinstance(state, tuple) else state
print("shape", y.shape[0], y.shape[1], y.shape[2])
print("state", hidden.shape[0], hidden.shape[1])
```

### 和手写循环是同一件事

简洁实现没有换成别的公式，只是少写了时间循环。循环层这一页的四步同样只看 loss。

延伸阅读：[简洁实现](https://zh.d2l.ai/chapter_recurrent-neural-networks/rnn-concise.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-neural-networks/rnn-concise.html)。
