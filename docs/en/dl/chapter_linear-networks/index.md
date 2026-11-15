---
language: dl
chapter: 12
title: "Linear neural networks"
level: beginner
minutes: 6
goals:
  - "See the path from a line to classes"
  - "Remember the 32 plus 8 images"
  - "Leave the four updates for later files"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-13"
---

This group starts with fitting a line and ends at a ten-way classifier. Images use 32 training rows and 8 check rows, and an update runs for four steps.

### A line, then ten classes

The first sections use a synthetic line and do not read images. Softmax first watches scores become probabilities on a small matrix, then runs the same kind of linear layer for four steps on clothing images.

### The opener does not read images

The contents page does not open the dataset and does not create weights. The next two blocks stay read-only. The real four-step updates live in later files.

```numpy norun title="Linear opener"
# The opener does not read images
print('linear-open')
```

### Accuracy is only a print

A classification section also prints acc, but passing does not depend on that number being high. After four steps, a readable loss means the path ran.

```numpy norun title="No accuracy gate"
# Accuracy is not a gate
print('acc-is-not-a-gate')
```

Pages: [zh](https://zh.d2l.ai/chapter_linear-networks/index.html) and [en](https://d2l.ai/chapter_linear-networks/index.html).
