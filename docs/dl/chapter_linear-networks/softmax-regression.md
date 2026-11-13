---
language: dl
chapter: 16
title: "softmax 回归"
level: beginner
minutes: 8
goals:
  - "把一行分数变成概率"
  - "核对概率之和"
  - "计算两行的交叉熵"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

三个分数先减去最大值再做指数，然后除以总和，得到的三个概率加起来是 1。交叉熵看正确类别上的概率有多小。

### 概率加起来是 1

输入一行三个分数。第一项概率保留四位小数，三项之和也保留四位。和应打印成 1。这一段没有训练循环。

```numpy run expect="1.0" title="概率和"
# 先减最大值再归一
import minitorch as mt
logits = mt.tensor([[2.0, 1.0, 0.1]])
prob = mt.softmax(logits)
print(round(float(prob[0].sum()), 4), round(float(prob[0, 0]), 4))
```

### 两行的交叉熵

第一行的正确类是 0，第二行的正确类是 2。损失是这两行负对数概率的平均，打印时带上 loss。

```numpy run expect="loss" title="交叉熵"
# 标签是 0 和 2
import minitorch as mt
logits = mt.tensor([[2.0, 1.0, 0.1], [0.2, 0.2, 2.0]])
loss = mt.cross_entropy(logits, [0, 2])
print("loss", round(loss.item(), 4))
```

### 图片节才把分数接到像素上

这里的分数是写死的小数。下一节能打开的图片把 784 个像素乘上权重，得到 10 个分数，再用同一个交叉熵。

延伸阅读：[softmax 回归](https://zh.d2l.ai/chapter_linear-networks/softmax-regression.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/softmax-regression.html)。
