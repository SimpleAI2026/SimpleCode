---
language: dl
chapter: 119
title: "Four merges"
level: intermediate
minutes: 8
goals:
  - "Merge on an excerpt of about 2 KB"
  - "Merge the most frequent pair first"
  - "Do not load an outside subword model"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The subword page uses a second seeded passage, about 1852 bytes. Each word is split into characters and given an end mark. Four merges run, and a tie takes the pair that sorts earlier. No pretrained subword table is read.

### The first merge

The excerpt is 1852 bytes. The left piece of the first of the four merges is the letter e. After merging, the first symbol of the first word is t.

```numpy run expect="bpe 1852 4 e t" title="The first merge"
# the first of four merges
import minitorch as mt
import numpy as np
text = mt.bpe_excerpt()
merges, words = mt.bpe_merges(text, 4)
print("bpe", len(text.encode("utf-8")), len(merges), merges[0][0], words[0][0])
```

### The end mark is still there

The right piece of the first pair is the end mark. The merge glues it to the character before it. This page does not send the merged symbols into an embedding.

```numpy run expect="end </w>" title="The end mark is still there"
# the right piece of the first pair
import minitorch as mt
import numpy as np
text = mt.bpe_excerpt()
merges, _words = mt.bpe_merges(text, 4)
print("end", merges[0][1])
```

### Four merges are not a full subword table

The subword page stops after four merges so the most frequent pair can be checked. It does not keep merging to a fixed vocabulary size, and it does not load outside vectors.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/subword-embedding.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/subword-embedding.html).
