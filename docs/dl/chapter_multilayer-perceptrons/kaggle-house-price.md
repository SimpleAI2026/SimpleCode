---
language: dl
chapter: 30
title: "预测房价"
level: intermediate
minutes: 8
goals:
  - "读 16 加 8 行"
  - "按训练行标准化"
  - "四步后打印两处损失"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

表有 24 行，前 16 行训练，后 8 行检查，最后一列是价格。这些数是页面生成的，不是竞赛原表。特征按训练行做标准化，线性模型走四步。

### 标准化之后的四步

每一列减去训练均值，再除以训练标准差。学习率 0.05，每步四行。最后打印训练损失和八行检查上的损失。

```numpy run expect="loss" title="房价四步"
# 16 行训练 8 行检查
import numpy as np
import minitorch as mt
x, y, xt, yt = mt.datasets.house_prices()
mu = x.mean(axis=0)
sd = np.where(x.std(axis=0) < 1e-8, 1.0, x.std(axis=0))
def norm(a):
    return (a - mu) / sd
w = mt.tensor(np.zeros(x.shape[1]), requires_grad=True)
b = mt.tensor(np.zeros(1), requires_grad=True)
last = 0.0
for step in range(4):
    xb = norm(x[step * 4:(step + 1) * 4])
    yb = y[step * 4:(step + 1) * 4]
    w.grad = None
    b.grad = None
    pred = mt.tensor(xb) @ w + b
    loss = ((pred - mt.tensor(yb)) * (pred - mt.tensor(yb))).mean()
    loss.backward()
    w.data -= 0.05 * w.grad
    b.data -= 0.05 * b.grad
    last = loss.item()
vpred = mt.tensor(norm(xt)) @ w + b
vloss = ((vpred - mt.tensor(yt)) * (vpred - mt.tensor(yt))).mean()
print("loss", round(last, 4), round(float(vloss.item()), 4))
```

### 行数和列数

训练 16 行，检查 8 行，特征列不含价格。列数应是 36。这一段不更新权重。

```numpy run expect="rows 16 8 36" title="房价形状"
# 价格不在特征里
import minitorch as mt
x, y, xt, yt = mt.datasets.house_prices()
print("rows", x.shape[0], xt.shape[0], x.shape[1])
```

### 不下载竞赛原表

原表大约零点九兆，而且再分发的条件没有在这里核清。所以文件保持约八千字节的合成行，这一节仍按缩减来写。

延伸阅读：[预测房价](https://zh.d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/kaggle-house-price.html)。
