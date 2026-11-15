---
language: dl
chapter: 38
title: "卷积神经网络"
level: beginner
minutes: 6
goals:
  - "知道本组从局部窗口写到 LeNet"
  - "输入保持 28 乘 28"
  - "四步只为看见 loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

这一组先在 3 乘 3 的小矩阵上做互相关，再讲填充、通道和汇聚，最后用 32 张服装图走一个 LeNet。图不放大到 224。

### 先看整数，再看四步

手算例子的输出是固定整数。LeNet 那一节才读取图片，并且只更新四步。

```numpy norun title="先看整数，再看四步"
# 章首不做卷积
print("conv-open")
```

### 不把图放大

服装图本来就是 28 乘 28。后面的现代网络也沿用这个边长，通道数会减少，并在那一页写明。

```numpy norun title="不把图放大"
# LeNet 在后面
print("lenet-later")
```

### 准确率仍然只是打印

分类网络会多印一次 acc。通过与否看的是 loss 这几个字母，不看 acc 高不高。

延伸阅读：[卷积神经网络](https://zh.d2l.ai/chapter_convolutional-neural-networks/index.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-neural-networks/index.html)。
