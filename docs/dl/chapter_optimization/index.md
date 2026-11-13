---
language: dl
chapter: 78
title: "优化算法"
level: intermediate
minutes: 6
goals:
  - "知道本组比较几种更新"
  - "记住标量例子只走四步"
  - "把机翼表当成合成数据"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

优化这一组从凸函数的不等式写到几种逐步更新，最后给学习率加一个倍率。带数据的只有机翼那一节，用 32 行合成表走四步。

### 多数例子是标量

梯度下降、动量、AdaGrad、RMSProp、Adadelta 和 Adam 都去靠近 3 这个目标，参数从 0 出发，只走四步。

### 章首不更新

目录页没有参数。下面两段只读，公式留在各节自己的代码里。

```numpy norun title="优化章首"
# 章首不更新
print('opt-open')
```

### 机翼表是合成的

三十二行、五列输入加一列目标，约两千字节。它不是 UCI 的原文件。小批量那一节会把它标准化后再更新。

```numpy norun title="机翼表"
# 不读取 UCI 原文件
print('airfoil-is-synthetic')
```

延伸阅读：[优化算法](https://zh.d2l.ai/chapter_optimization/index.html)，英文页在[这里](https://d2l.ai/chapter_optimization/index.html)。
