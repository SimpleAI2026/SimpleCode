---
language: dl
chapter: 19
title: "softmax 的简洁实现"
level: beginner
minutes: 8
goals:
  - "用线性层输出 10 个分数"
  - "SGD 更新四步"
  - "核对四行输入的形状"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

十分类改成一个线性层，输出维是 10。随机种子先固定，再用 SGD 在四张图上更新四次，最后对八张检查图打印 acc。

### 层和优化器

构造层时会抽一组小的初始权重，所以种子要写在构造之前。四步的损失和一次检查的 acc 分两行打印。

```numpy run expect="loss" title="简洁 softmax"
# 输出维是 10
import minitorch as mt
import numpy as np
np.random.seed(0)
x, y, xt, yt = mt.datasets.fashion_mnist()
net = mt.nn.Linear(784, 10)
opt = mt.optim.SGD(net.parameters(), lr=0.1)
last = 0.0
for step in range(4):
    opt.zero_grad()
    xb = mt.tensor(mt.datasets.scale_batch(x[step * 4:(step + 1) * 4]))
    yb = y[step * 4:(step + 1) * 4]
    loss = mt.cross_entropy(net(xb), yb)
    loss.backward()
    opt.step()
    last = loss.item()
acc = mt.accuracy(net(mt.tensor(mt.datasets.scale_batch(xt))), yt)
print("loss", round(last, 4))
print("acc", round(acc, 3))
```

### 四行零图的形状

四行全零的输入经过层之后应得到四行十列。这一段不读取图片文件，只核对形状。

```numpy run expect="shape 4 10" title="输出形状"
# 不读取图片文件
import minitorch as mt
import numpy as np
np.random.seed(1)
net = mt.nn.Linear(784, 10)
out = net(mt.tensor(np.zeros((4, 784))))
print("shape", out.shape[0], out.shape[1])
```

### 下一步加一层激活

只有一个线性层时，分数是像素的加权和。多层感知机会在中间插入整流，再用第二个线性层把宽度收到 10。

延伸阅读：[softmax 的简洁实现](https://zh.d2l.ai/chapter_linear-networks/softmax-regression-concise.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/softmax-regression-concise.html)。
