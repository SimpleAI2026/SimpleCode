---
language: dl
chapter: 45
title: "现代卷积网络"
level: intermediate
minutes: 6
goals:
  - "知道本组沿用 28 乘 28"
  - "通道和核都比原结构小"
  - "每节仍只走四步"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

AlexNet、VGG、NiN、GoogLeNet、ResNet、DenseNet 都在这 32 张图上走四步。原结构面向 224 的边长，这里不放大，通道和核写在每一页的修改说明里。

### 层的种类留下来

卷积、整流、汇聚、拉直和线性层都还在。变的是通道数、核的边长，以及堆叠的次数。

```numpy norun title="层的种类留下来"
# 章首不训练
print("modern-open")
```

### 批量规范化单独一页

那一页先在 2 乘 2 的矩阵上把公式跑完，再把同样的层插进 LeNet 走四步。

```numpy norun title="批量规范化单独一页"
# 通道在各页减少
print("channels-cut")
```

### 仍然打印 loss

每节的第一段可运行代码都以 loss 结尾。形状段只看四行十列，不看分类对错。

延伸阅读：[现代卷积网络](https://zh.d2l.ai/chapter_convolutional-modern/index.html)，英文页在[这里](https://d2l.ai/chapter_convolutional-modern/index.html)。
