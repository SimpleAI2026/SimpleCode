---
language: dl
chapter: 124
title: "应用这一组"
level: intermediate
minutes: 8
goals:
  - "短评和句子对分开"
  - "四步仍是上限"
  - "开篇不跑模型"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

应用这一组用十二句短评和十二对句子。循环网络、卷积和窄编码器都从随机权重开始。开篇不训练。

### 两类数据

短评是正面或负面。句子对的标签是蕴含、矛盾或中性。两边都不读取外部语料包。

```numpy norun title="两类数据"
# 开篇不训练
import minitorch as mt
import numpy as np
print("apply-open")
```

### 随机权重

应用页不加载前面四步得到的编码器当成品。微调页自己再初始化一块窄编码器。

```numpy norun title="随机权重"
# 权重重新初始化
import minitorch as mt
import numpy as np
print("apply-random")
```

### 开篇只点名后面的页

应用开篇不计算情感分数，也不计算句对的注意力。那些都在带四步的页上。

延伸阅读：[应用这一组](https://zh.d2l.ai/chapter_natural-language-processing-applications/index.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/index.html)。
