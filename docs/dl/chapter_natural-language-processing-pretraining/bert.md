---
language: dl
chapter: 121
title: "窄编码器的一次前向"
level: intermediate
minutes: 8
goals:
  - "宽度 16，两头"
  - "句长 6"
  - "只看输出形状"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

编码器这页把结构收窄：隐藏宽度 16，两个注意力头，前馈中间层 32，句长 6。输入是全零。只做一次前向，看输出仍是 4 乘 6 乘 16。

### 形状保持 4 乘 6 乘 16

一块编码器包含注意力、残差、归一化和两层前馈。全零输入经过它，批量、长度和宽度都不变。

```numpy run expect="shape 4 6 16" title="形状保持 4 乘 6 乘 16"
# 一次前向的形状
import minitorch as mt
import numpy as np
np.random.seed(0)
x = mt.tensor(np.zeros((4, 6, 16)))
y = mt.nn.EncoderBlock(16, 2, 32)(x)
print("shape", y.shape[0], y.shape[1], y.shape[2])
```

### 位置编码的行数

正弦位置表有 6 行、16 列，加在词向量上。这里只打印行数，不和词向量相加。

```numpy run expect="pos 6 16" title="位置编码的行数"
# 位置表的形状
import minitorch as mt
import numpy as np
pos = mt.positional_encoding(6, 16)
print("pos", pos.shape[0], pos.shape[1])
```

### 一次前向不更新权重

窄编码器这页没有掩码目标，也没有四步。预训练页才会用四句短文把掩码损失和下一句损失加起来。

延伸阅读：[窄编码器的一次前向](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/bert.html)。
