---
language: dl
chapter: 125
title: "十二条短评"
level: intermediate
minutes: 8
goals:
  - "八条训练、四条检查"
  - "截断到六个词"
  - "正负标签各半"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

情感数据是手写的十二条英文短评，不是影评压缩包。前八条训练，后四条检查。训练里四个正面、四个负面。超过六个词的句子会截断。

### 条数和正面个数

训练 8 条，检查 4 条。训练标签之和是 4，检查标签之和是 2。标签 1 是正面。

```numpy run expect="reviews 8 4 4 2" title="条数和正面个数"
# 短评条数
import minitorch as mt
import numpy as np
texts, labels, held, held_y = mt.sentiment_reviews()
print("reviews", len(texts), len(held), int(labels.sum()), int(held_y.sum()))
```

### 截断长度是 6

后面的循环网络和卷积都只看前六个词，不够的位置补 0。这里先把长度打印出来。

```numpy run expect="clip 6" title="截断长度是 6"
# 截断长度
import minitorch as mt
import numpy as np
print("clip", 6)
```

### 十二条不是影评库

情感数据页的句子是为了让正负各半而写的，没有评分星级，也没有那份几十兆的原文。下一页会把八条分成两批轮流走。

延伸阅读：[十二条短评](https://zh.d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-and-dataset.html)，英文页在[这里](https://d2l.ai/chapter_natural-language-processing-applications/sentiment-analysis-and-dataset.html)。
