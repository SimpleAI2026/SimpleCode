---
language: dl
chapter: 95
title: "No gradient sum across cards"
level: intermediate
minutes: 6
goals:
  - "Take gradients from the current batch"
  - "Keep a single parameter copy"
  - "Leave the card count at one"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Multi-card training would add gradients from each card and write them back. This page has no second card and no collective communication.

### Gradients come from these four rows

SGD uses the gradient from the current four rows. No other batch of gradients arrives from another card to be added.

```numpy norun title="Gradients come from these four rows"
# No collective
print("gpu-none")
```

### Parameters are not replicated

The optimizer holds the tensors on the module. There is no second set of weights copied per card and no broadcast of an average.

```numpy norun title="Parameters are not replicated"
# One set of weights
print("gpu-one-copy")
```

### The card axis has no range

A throughput curve needs at least two card counts. The multi-card page stays at one card, so that axis cannot be drawn.

Pages: [zh](https://zh.d2l.ai/chapter_computational-performance/multiple-gpus.html) and [en](https://d2l.ai/chapter_computational-performance/multiple-gpus.html).
