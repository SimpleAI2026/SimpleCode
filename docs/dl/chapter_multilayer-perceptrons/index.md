---
language: dl
chapter: 20
title: "多层感知机"
level: intermediate
minutes: 6
goals:
  - "知道中间会插入整流"
  - "记住训练仍是四步"
  - "把房价表和竞赛原表分开"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

这一组在线性层中间加上整流，再用同一份 32 张图走四步。欠拟合、权重衰减、暂退、数值稳定和房价都在后面单独成节。

### 先看激活再看训练

整流把负数变成 0，正数原样留下。从零实现和简洁实现都只用四步，并各打印一次 acc。

### 章首不建网络

目录页没有参数。下面两段只读，避免在打开章节列表时就跑反向。

```numpy norun title="感知机章首"
# 章首不反向
print('mlp-open')
```

### 房价用合成小表

预测房价那一节读的是页面自带的 16 加 8 行，不是竞赛原表。列是数值特征，最后一列当目标。

```numpy norun title="房价表"
# 房价表不是竞赛原件
print('house-is-synthetic')
```

延伸阅读：[多层感知机](https://zh.d2l.ai/chapter_multilayer-perceptrons/index.html)，英文页在[这里](https://d2l.ai/chapter_multilayer-perceptrons/index.html)。
