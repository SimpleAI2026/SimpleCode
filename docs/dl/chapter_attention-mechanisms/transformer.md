---
language: dl
chapter: 77
title: "Transformer"
level: intermediate
minutes: 8
goals:
  - "宽度写成 16，只用一块"
  - "加上长度为 4 的位置编码"
  - "在摘录上走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这里的 Transformer 只有一块：多头自注意力、层归一化，再加一个线性层。宽度是 16，比常见的堆叠更窄，时间长度是 4。

### 四步和一次检查

位置编码按时间加到嵌入上。四步的窗口仍来自那一小段合成文本，检查一次 8 条窗口。

```numpy run expect="loss" title="四步和一次检查"
# 一块，宽度 16
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
class Block(mt.nn.Module):
    def __init__(self):
        self.attn = mt.nn.MultiHeadAttention(16, 2)
        self.norm = mt.nn.LayerNorm(16)
        self.ff = mt.nn.Linear(16, 16)
    def forward(self, tokens):
        h = self.norm(tokens + self.attn(tokens, tokens, tokens))
        return h + self.ff(h).relu()
block = Block()
pe = mt.tensor(mt.positional_encoding(4, 16))
head = mt.nn.Linear(16, width)
params = emb.parameters() + block.parameters() + head.parameters()
opt = mt.optim.SGD(params, lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    batch = train[step * 4:(step + 1) * 4]
    x = np.stack([row[:-1] for row in batch])
    y = np.stack([row[1:] for row in batch])
    out = block(emb(x) + pe)
    loss = mt.cross_entropy(head(out.reshape(16, 16)), y.reshape(-1))
    loss.backward()
    mt.clip_grad(params, 1.0)
    opt.step()
    last = loss.item()
x = np.stack([row[:-1] for row in val])
y = np.stack([row[1:] for row in val])
out = block(emb(x) + pe)
acc = mt.accuracy(head(out.reshape(32, 16)), y.reshape(-1))
print("loss", round(last, 4), "acc", round(acc, 4))
```

### 一块之后的形状

零输入加上位置编码，经过这一块，批量、时间和宽度都保持 2、4、16。

```numpy run expect="shape 2 4 16" title="一块之后的形状"
# 只走一块
import minitorch as mt
import numpy as np
np.random.seed(0)
class Block(mt.nn.Module):
    def __init__(self):
        self.attn = mt.nn.MultiHeadAttention(16, 2)
        self.norm = mt.nn.LayerNorm(16)
        self.ff = mt.nn.Linear(16, 16)
    def forward(self, tokens):
        h = self.norm(tokens + self.attn(tokens, tokens, tokens))
        return h + self.ff(h).relu()
x = mt.tensor(np.zeros((2, 4, 16)))
pe = mt.tensor(mt.positional_encoding(4, 16))
y = Block()(x + pe)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 窄模型就停在这里

Transformer 这一页写明宽度 16、一块、四步。它不堆更多层，打印出 loss 就结束。

延伸阅读：[Transformer](https://zh.d2l.ai/chapter_attention-mechanisms/transformer.html)，英文页在[这里](https://d2l.ai/chapter_attention-mechanisms/transformer.html)。
