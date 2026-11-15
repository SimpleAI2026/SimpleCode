---
language: dl
chapter: 12
title: "线性神经网络"
level: beginner
minutes: 6
goals:
  - "知道本组从直线写到分类"
  - "记住图片只有 32 加 8 张"
  - "把四步更新留在后文"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

线性神经网络这一组从一条直线的拟合写到十分类。图片只用 32 张训练和 8 张检查，更新只走四步。

### 直线和十分类

前两节用合成的直线，不读图片。softmax 先在小矩阵上看分数怎么变成概率，再用服装图片把同样的线性层跑四步。

### 章首不读图片

目录页不打开数据集，也不创建权重。下面两段保持只读，真正的四步更新写在后面的文件里。

```numpy norun title="线性章首"
# 章首不读图片
print('linear-open')
```

### 准确率只是打印

分类节会多印一次 acc，但通过与否不看它高不高。四步之后能读到 loss 就算这条链路通了。

```numpy norun title="不设门槛"
# 不设准确率门槛
print('acc-is-not-a-gate')
```

延伸阅读：[线性神经网络](https://zh.d2l.ai/chapter_linear-networks/index.html)，英文页在[这里](https://d2l.ai/chapter_linear-networks/index.html)。
