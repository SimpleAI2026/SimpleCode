---
language: dl
chapter: 113
title: "Pretraining, in outline"
level: intermediate
minutes: 8
goals:
  - "Separate word vectors from the encoder"
  - "See that the text is written here"
  - "Leave the opener untrained"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This group starts with word vectors inside a window, then a narrow encoder. The lines are short sentences from fixed seeds. No treebank or encyclopedia is downloaded. The opener does not train.

### Two jobs

The first half is a center word and its neighbors. The second half is a masked word and a next-line label. Widths are written down. Four steps appear only on training pages.

```numpy norun title="Two jobs"
# opener does not train
import minitorch as mt
import numpy as np
print("nlp-open")
```

### No outside vectors

These pages do not read a ready-made vector file or a subword model. Every printed number comes from the short lines in this book.

```numpy norun title="No outside vectors"
# outside vectors stay unread
import minitorch as mt
import numpy as np
print("nlp-local")
```

### The opener stops at the agreement

The pretraining opener only agrees where the lines come from and which pages take four steps. The window, the co-occurrence, and the mask stay later.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/index.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/index.html).
