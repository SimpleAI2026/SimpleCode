---
language: dl
chapter: 98
title: "Computer vision"
level: intermediate
minutes: 8
goals:
  - "See that this group covers detection and segmentation"
  - "Tell full, reduced, and read-only pages apart"
  - "Know the pictures are drawn in memory"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

This group walks from a flipped clothing photo to boxes, anchors, detection heads, pixel labels, and a style loss. Runnable pages use tiny arrays. The opener does not train.

### Tasks first, then the page type

Augmentation, fine-tuning, and the two contest pages are shortened. Boxes, anchors, multi-scale maps, and transposed convolution keep the formulas. Detection and segmentation later keep four steps.

```numpy norun title="Tasks first, then the page type"
# opener does not train
import minitorch as mt
import numpy as np
print("vision-open")
```

### Samples stay out of the archives

Fine-tuning, detection, segmentation, and the two classification stand-ins are drawn in memory from fixed seeds. The page does not download the hot-dog, banana, VOC, or contest archives.

```numpy norun title="Samples stay out of the archives"
# archives are not downloaded
import minitorch as mt
import numpy as np
print("vision-later")
```

### The read-only page stops at the agreement

The vision opener only agrees the page types and where the pictures come from. Weights, boxes, and losses stay on the later pages and do not start here.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/index.html) and [en](https://d2l.ai/chapter_computer-vision/index.html).
