---
language: dl
chapter: 66
title: "Machine translation and the dataset"
level: beginner
minutes: 8
goals:
  - "Read 16 training pairs"
  - "Keep 8 check pairs"
  - "Keep four words on each side"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The translation sample is 24 synthetic English-French lines split by a tab. This page only counts and builds a vocabulary. It does not train an encoder.

### Sixteen plus eight

The first 16 lines train and the last 8 check. The loader does not bring in any further lines.

```numpy run expect="train 16" title="Sixteen plus eight"
# Split on lines
import minitorch as mt
train, val = mt.datasets.translation_pairs()
print("train", len(train))
print("val", len(val))
```

### Four words on each side

The first English line splits into 4 words. All 24 pairs together also yield a vocabulary width.

```numpy run expect="width 4" title="Four words on each side"
# Count the vocabulary
import minitorch as mt
train, val = mt.datasets.translation_pairs()
words = []
for eng, fra in train + val:
    words.extend(eng.split())
    words.extend(fra.split())
print("width", len(train[0][0].split()))
print("vocab", len(set(words)))
```

### This is not a parallel corpus

These sentences are 24 lines from the generator. No archive was downloaded. The translation-data page only checks 16, 8, and 4 words on a side.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/machine-translation-and-dataset.html) and [en](https://d2l.ai/chapter_recurrent-modern/machine-translation-and-dataset.html).
