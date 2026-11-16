---
language: dl
chapter: 55
title: "Text preprocessing"
level: beginner
minutes: 8
goals:
  - "Count words in the synthetic text"
  - "Count the distinct words"
  - "Keep the sample near two kilobytes"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Preprocessing does two things: split on spaces, then drop periods. The sample is short generated sentences standing in for a long book.

### Count the words

After lowercasing, spaces separate words and a period is not its own word. The printed count is the raw material for later windows.

```numpy run expect="tokens 382" title="Count the words"
# Drop the periods
import minitorch as mt
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
print("tokens", len(words))
```

### How wide the vocabulary is

The same words go into a set and are then sorted. The width is small, so a later linear layer can face it directly.

```numpy run expect="vocab 26" title="How wide the vocabulary is"
# A sorted set
import minitorch as mt
text = mt.datasets.time_machine().lower()
words = [w.strip(".,") for w in text.split() if w.strip(".,")]
print("vocab", len(set(words)))
```

### The whole book is not downloaded

The file on disk is about two kilobytes, and the sentences come from a fixed generator. This preprocessing page only reports 382 words and 26 forms.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-neural-networks/text-preprocessing.html) and [en](https://d2l.ai/chapter_recurrent-neural-networks/text-preprocessing.html).
