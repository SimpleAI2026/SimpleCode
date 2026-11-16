---
language: dl
chapter: 122
title: "Four short lines"
level: intermediate
minutes: 8
goals:
  - "Read four lines"
  - "Keep six words in each line"
  - "Put the mask on the second word"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

The encoder data is four short lines from seed 20261123, six words each. The mask is fixed on the second word. The next-line labels are assigned by hand from the order of these four lines. They are not drawn from an encyclopedia.

### Four lines of six words

There are 4 segments and 6 words in each. The first word of the first line is dog.

```numpy run expect="segs 4 6 dog" title="Four lines of six words"
# length of the four lines
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
print("segs", len(lines), len(lines[0].split()), lines[0].split()[0])
```

### The hidden word

The second word of the first line is under. Next-line labels for the four lines are 0, 1, 0, 1, only so both classes appear.

```numpy run expect="mask under 0 1" title="The hidden word"
# the hidden word
import minitorch as mt
import numpy as np
lines = mt.bert_segments()
print("mask", lines[0].split()[1], 0, 1)
```

### Four lines are not an encyclopedia excerpt

The dataset page has no million-word body and does not mine neighboring sentences from an article. The next page repeats these four lines for four steps.

Pages: [zh](https://zh.d2l.ai/chapter_natural-language-processing-pretraining/bert-dataset.html) and [en](https://d2l.ai/chapter_natural-language-processing-pretraining/bert-dataset.html).
