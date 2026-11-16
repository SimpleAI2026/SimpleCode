---
language: dl
chapter: 61
title: "Modern recurrent networks"
level: beginner
minutes: 8
goals:
  - "Go from gated cells to a bidirectional net"
  - "Keep the translation sample at 24 pairs"
  - "Still judge four steps by loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This group switches to GRU and LSTM, then stacks two layers and a backward pass, and finally looks at encoding and decoding on 24 short pairs. Each side has four words.

### Gates come on the later pages

The opener does not compute a gate. GRU and LSTM each take four steps on the same short text.

```numpy norun title="Gates come on the later pages"
# The opener does not compute a gate
print("modern-open")
```

### The pair list is tiny

The translation sample is 16 training pairs and 8 check pairs, not a full parallel corpus. The sequence-to-sequence page says so.

```numpy norun title="The pair list is tiny"
# Twenty-four pairs
print("pairs-later")
```

### The print agreement stays

Training pages in the modern recurrent group still print acc. Passing still looks only at loss. The opener of this group leaves that sentence here.

Pages: [zh](https://zh.d2l.ai/chapter_recurrent-modern/index.html) and [en](https://d2l.ai/chapter_recurrent-modern/index.html).
