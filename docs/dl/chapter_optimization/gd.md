---
language: dl
chapter: 81
title: "梯度下降"
level: intermediate
minutes: 8
goals:
  - "用导数把平方往下推"
  - "从 4 走四步"
  - "对照单步和四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

目标是把 x 的平方变小。导数是 2x。学习率 0.25 时，每步把 x 乘上 0.5。从 4 出发四步之后，损失是剩下的平方。

### 四次折半

4 乘上 0.5 的四次方是 0.25，平方是 0.0625。打印带 loss。没有随机抽样，因为每步都用同一个导数。

```numpy run expect="loss 0.0625" title="四次折半"
# 每步乘 0.5
x = 4.0
lr = 0.25
for _ in range(4):
    x = x - lr * (2.0 * x)
print("loss", round(x * x, 4))
```

### 单步的结果

只走一步时，4 变成 2。这一段把那一次乘法单独印出来，方便和四步之后的 0.25 对照。

```numpy run expect="2.0" title="单步"
# 4 乘 0.5 等于 2
x = 4.0
print(round(x * (1.0 - 2.0 * 0.25), 4))
```

### 下一步改成每次一个样本

全梯度每步都看全部项。随机梯度下降每步只抽一个下标，梯度因此会抖，四步的损失不再是上面这个确定的小数。

延伸阅读：[梯度下降](https://zh.d2l.ai/chapter_optimization/gd.html)，英文页在[这里](https://d2l.ai/chapter_optimization/gd.html)。
