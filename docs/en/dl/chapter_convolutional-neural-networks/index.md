---
language: dl
chapter: 38
title: "Convolutional networks"
level: beginner
minutes: 6
goals:
  - "See the path from a local window to LeNet"
  - "Keep the input at 28 by 28"
  - "Use four steps only to see a loss"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-15"
---

This group starts with cross-correlation on a 3 by 3 matrix, then padding, channels, and pooling, and ends with LeNet on 32 clothing images. Images are not enlarged to 224.

### Integers first, then four steps

The hand examples print fixed integers. Only the LeNet section reads images, and it updates for four steps.

```numpy norun title="Integers first, then four steps"
# The opener does not convolve
print("conv-open")
```

### The image is not enlarged

The clothing images are already 28 by 28. Later modern networks keep that edge length, cut the channel counts, and say so on their own page.

```numpy norun title="The image is not enlarged"
# LeNet comes later
print("lenet-later")
```

### Accuracy is still only a print

A classifier also prints acc. Passing looks for the letters in loss, not for a high acc.

Pages: [zh](https://zh.d2l.ai/chapter_convolutional-neural-networks/index.html) and [en](https://d2l.ai/chapter_convolutional-neural-networks/index.html).
