---
language: dl
chapter: 138
title: "书上的名字对本页的类"
level: intermediate
minutes: 6
goals:
  - "对照表由本仓库编写"
  - "损失和数据用本页的函数名"
  - "参数顺序以源码为准"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

书上的层和优化器用的是另一套库的名字。下表是本页实际构造的类。表是这里写的，上游手册只放在章末链接里。

### 层和优化器

常见叫法写在前面，`minitorch` 里的构造写在后面。

- 线性层是 nn.Linear，整流是 nn.ReLU，丢弃是 nn.Dropout，顺序堆叠是 nn.Sequential。
- 卷积是 nn.Conv2d，最大汇聚是 nn.MaxPool2d，平均汇聚是 nn.AvgPool2d，展平是 nn.Flatten。
- 批量规范化是 nn.BatchNorm，嵌入是 nn.Embedding，循环层是 nn.RNN，门控循环是 nn.GRU。
- 长短期记忆是 nn.LSTM，层规范化是 nn.LayerNorm，多头注意力是 nn.MultiHeadAttention。
- 编码器块是 nn.EncoderBlock，转置卷积是 nn.ConvTranspose2d。
- 小批量梯度是 optim.SGD，动量是 optim.Momentum，自适应梯度是 optim.AdaGrad。
- 均方根是 optim.RMSProp，自适应步长是 optim.Adadelta，亚当是 optim.Adam。

```numpy norun title="层和优化器"
# 对照在本页
print("map-local")
```

### 损失和样本函数

多类损失叫 cross_entropy，二元形式叫 bce_with_logits。小样本从 datasets 读，准确率用 accuracy。这些名字都不从网上拉取权重。

```numpy norun title="损失和样本函数"
# 不拉取权重
print("map-noweight")
```

### 参数顺序看源码

名字对照这一页不复制上游文档的关键字。构造函数的参数顺序和默认值以仓库里的 minitorch.py 为准。

延伸阅读：[书上的名字对本页的类](https://zh.d2l.ai/chapter_appendix-tools-for-deep-learning/d2l.html)，英文页在[这里](https://d2l.ai/chapter_appendix-tools-for-deep-learning/d2l.html)。
