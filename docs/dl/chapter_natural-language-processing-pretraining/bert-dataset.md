---
language: dl
chapter: 122
title: "四句短文"
level: intermediate
minutes: 8
goals:
  - "读出四句"
  - "每句六个词"
  - "掩码落在第二个词"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

编码器的数据是四句短文，种子 20261123，每句六个词。掩码固定落在第二个词。下一句标签由这四句的顺序手写，不是从百科里抽的。

### 四句都以六个词开头

段数是 4，每段 6 个词。第一句的第一个词是 dog。

```numpy run expect="segs 4 6 dog" title="四句都以六个词开头"
# 四句的长度
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
print("segs", len(lines), len(lines[0].split()), lines[0].split()[0])
```

### 被遮住的词

第一句的第二个词是 under。四句的下一句标签按 0、1、0、1 排，只是为了让两类都出现。

```numpy run expect="mask under 0 1" title="被遮住的词"
# 被遮住的词
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
print("mask", lines[0].split()[1], 0, 1)
```

### 四句不是百科摘录

数据集这页没有百万字的正文，也没有把相邻句从一篇文章里抽出来。下一页会把这四句重复用来走四步。

延伸阅读：[四句短文](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert-dataset.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/bert-dataset.html)。
