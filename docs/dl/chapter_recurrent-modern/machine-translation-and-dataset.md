---
language: dl
chapter: 66
title: "机器翻译和数据集"
level: beginner
minutes: 8
goals:
  - "读出 16 对训练句"
  - "再留 8 对检查句"
  - "每边都是四个词"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

翻译样本是 24 行合成的英法短句，用制表符分开。这一页只做计数和词表，不训练编码器。

### 十六加八

前 16 行是训练，后 8 行是检查。加载器不会把更多行带进来。

```numpy run expect="train 16" title="十六加八"
# 按行切开
import minitorch as mt
train, val = mt.datasets.translation_pairs()
print("train", len(train))
print("val", len(val))
```

### 每边四个词

第一行英文切出来是 4 个词。全部 24 对放在一起，词表宽度也可以数出来。

```numpy run expect="width 4" title="每边四个词"
# 数词表
import minitorch as mt
train, val = mt.datasets.translation_pairs()
words = []
for eng, fra in train + val:
    words.extend(eng.split())
    words.extend(fra.split())
print("width", len(train[0][0].split()))
print("vocab", len(set(words)))
```

### 不是平行语料库

这些句子是生成器里的 24 行，没有下载压缩包。翻译数据页只核对 16、8 和每边 4 个词。

延伸阅读：[机器翻译和数据集](https://zh.d2l.ai/chapter_recurrent-modern/machine-translation-and-dataset.html)，英文页在[这里](https://d2l.ai/chapter_recurrent-modern/machine-translation-and-dataset.html)。
