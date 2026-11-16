---
language: dl
chapter: 113
title: "预训练这一组"
level: intermediate
minutes: 8
goals:
  - "分清词向量和编码器"
  - "知道语料是现写的"
  - "开篇不训练"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

这一组先做窗口里的词向量，再做窄的编码器。语料是固定种子写出来的短句，不下载树库或百科。开篇不跑训练。

### 两段任务

前半是中心词和邻居，后半是掩码词和下一句标签。宽度都会写明，四步只出现在训练页。

```numpy norun title="两段任务"
# 开篇不训练
import minitorch as mt
import numpy as np
print("nlp-open")
```

### 不收外部向量

页内不读取现成的词向量文件，也不读取子词模型。能打印的数都来自这一册的短句。

```numpy norun title="不收外部向量"
# 外部向量不读
import minitorch as mt
import numpy as np
print("nlp-local")
```

### 开篇停在约定

预训练开篇只约定语料从哪来、哪几页会走四步。具体的窗口、共现和掩码都留在后面。

延伸阅读：[预训练这一组](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/index.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/index.html)。
