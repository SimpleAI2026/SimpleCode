---
language: dl
chapter: 116
title: "Thirty-two short lines"
level: intermediate
minutes: 8
goals:
  - "Read 32 training lines and 8 check lines"
  - "Keep the vocabulary at 12 words"
  - "Do not download a treebank"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The embedding data is 32 training lines and 8 check lines. Each line has six words, drawn from twelve English words with seed 20261121. This is not the Penn Treebank.

### Line count and vocabulary

Training has 32 lines and the check split has 8. The training lines use 12 distinct words. The first line starts with tree.

```numpy run expect="lines 32 8 12 tree" title="Line count and vocabulary"
# line counts and the first word
import minitorch as mt
import numpy as np
rows, val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
print("lines", len(rows), len(val), len(vocab), rows[0].split()[0])
```

### The two ends of the vocabulary

After sorting, the first word is bird and the last word is under. Later pretraining uses only this vocabulary.

```numpy run expect="span bird under" title="The two ends of the vocabulary"
# first and last vocabulary words
import minitorch as mt
import numpy as np
rows, _val = mt.embed_lines()
vocab = sorted(set(" ".join(rows).split()))
print("span", vocab[0], vocab[-1])
```

### Thirty-two lines are not a treebank

The short lines on this page are redraws of twelve words. There are no syntax labels and none of the nearly two-megabyte source. Reading them is a split on spaces.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/word-embedding-dataset.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/word-embedding-dataset.html).
