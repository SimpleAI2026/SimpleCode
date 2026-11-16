---
language: dl
chapter: 128
title: "十二对句子"
level: intermediate
minutes: 8
goals:
  - "八对训练、四对检查"
  - "标签有三类"
  - "不下载推断语料"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

推断数据是手写的十二对短句。标签 0 是蕴含，1 是矛盾，2 是中性。前八对训练，后四对检查。这不是那份大型句对库。

### 对数和前两个标签

训练 8 对，检查 4 对。第一对的标签是 0，第三对是 1。

```numpy run expect="pairs 8 4 0 1" title="对数和前两个标签"
# 句对数量
import minitorch as mt
import numpy as np
left, _right, labels, vleft, _vright, _vy = mt.nli_pairs()
print("pairs", len(left), len(vleft), int(labels[0]), int(labels[2]))
```

### 三类都出现

训练标签里 0、1、2 都有。后面的注意力页会把假设当查询、前提当键。

```numpy run expect="kinds 3" title="三类都出现"
# 标签种类
import minitorch as mt
import numpy as np
_left, _right, labels, _vl, _vr, _vy = mt.nli_pairs()
print("kinds", len(set(int(v) for v in labels)))
```

### 十二对不是公开句对库

推断数据页的句子是为了让三类都能数到而写的。解析就是按空格切开，没有词性和句法树。

延伸阅读：[十二对句子](https://zh.d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-and-dataset.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/natural-language-inference-and-dataset.html)。
