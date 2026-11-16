---
language: dl
chapter: 119
title: "四次合并"
level: intermediate
minutes: 8
goals:
  - "在约 2 KB 的摘录上合并"
  - "先合频率最高的一对"
  - "不加载外部子词模型"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

子词这一页用另一份种子写的短文，大约 1852 字节。每个词先拆成字符，再加一个词尾标记。合并做四次，平局时按字母序取较小的一对。不读取预训练的子词表。

### 第一次合并

摘录是 1852 字节。四次合并里的第一对左边是字母 e。第一个词合并后的首符号是 t。

```numpy run expect="bpe 1852 4 e t" title="第一次合并"
# 四次合并的第一对
import minitorch as mt
import numpy as np
text = mt.bpe_excerpt()
merges, words = mt.bpe_merges(text, 4)
print("bpe", len(text.encode("utf-8")), len(merges), merges[0][0], words[0][0])
```

### 词尾标记还在

第一对的右边是词尾标记。合并把它和前面的字符粘在一起。这一页不把合并结果送进嵌入层。

```numpy run expect="end </w>" title="词尾标记还在"
# 第一对的右边
import minitorch as mt
import numpy as np
text = mt.bpe_excerpt()
merges, _words = mt.bpe_merges(text, 4)
print("end", merges[0][1])
```

### 四次不是一整张子词表

子词页停在四次合并，用来看频率最高的一对是谁。它不继续合并到固定词表大小，也不加载外部向量。

延伸阅读：[四次合并](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/subword-embedding.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/subword-embedding.html)。
