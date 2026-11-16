---
language: dl
chapter: 116
title: "三十二行短句"
level: intermediate
minutes: 8
goals:
  - "读出 32 行训练和 8 行检查"
  - "词表只有 12 个词"
  - "不下载树库"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

嵌入数据是 32 行训练和 8 行检查。每行六个词，词从十二个英文词里按种子 20261121 抽出。这不是宾州树库。

### 行数和词表

训练 32 行，检查 8 行。训练行里出现的不同词是 12 个。第一行以 tree 开头。

```numpy run expect="lines 32 8 12 tree" title="行数和词表"
# 行数和第一个词
import minitorch as mt
import numpy as np
rows, val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
print("lines", len(rows), len(val), len(vocab), rows[0].split()[0])
```

### 词表两头

排好序之后，最小的词是 bird，最大的词是 under。后面的预训练只用这个词表。

```numpy run expect="span bird under" title="词表两头"
# 词表首尾
import minitorch as mt
import numpy as np
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
print("span", vocab[0], vocab[-1])
```

### 三十二行不是树库

这页的短句由十二个词反复抽出，没有句法标注，也没有那份将近两兆的原文。读取就是按空格切开。

延伸阅读：[三十二行短句](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word-embedding-dataset.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-pretraining/word-embedding-dataset.html)。
