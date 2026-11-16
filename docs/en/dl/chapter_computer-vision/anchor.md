---
language: dl
chapter: 102
title: "Anchor boxes"
level: intermediate
minutes: 8
goals:
  - "Compute intersection over union for two boxes"
  - "Generate anchors on a 2 by 2 grid"
  - "Keep two boxes with suppression"
sources:
  - d2l-zh-text
  - d2l-en-text
updated: "2026-11-16"
---

Anchors are candidates laid on a grid in advance. Intersection over union is the overlap area divided by the union area. Suppression walks scores from high to low and drops a box that overlaps too much.

### The overlap ratio is one seventh

One box is the square from 0 to 2. The other starts at 1 and ends at 3. The overlap is 1, the union is 7, and the ratio is about 0.1429.

```numpy run expect="iou 0.1429" title="The overlap ratio is one seventh"
# overlap of two squares
import minitorch as mt
import numpy as np
iou = mt.box_iou([[0, 0, 2, 2]], [[1, 1, 3, 3]])
print("iou", round(float(iou[0, 0]), 4))
```

### Four cells and two ratios

Height and width are both 2. One size with two ratios makes 8 anchors. In the suppression example the box scored 0.9 is kept first, at index 1, and the far box is index 2.

```numpy run expect="keep 8 1 2" title="Four cells and two ratios"
# anchor count and suppression
import minitorch as mt
import numpy as np
anchors = mt.multibox_prior(2, 2, [0.5], [1.0, 2.0])
kept = mt.nms([[0, 0, 2, 2], [0.1, 0.1, 2.1, 2.1], [5, 5, 6, 6]], [0.2, 0.9, 0.4], 0.5)
print("keep", anchors.shape[0], int(kept[0]), int(kept[1]))
```

### The grid stays small here

The anchor page stays on a 2 by 2 grid so the overlap explanation does not fill a whole feature map. The multi-scale page is the one that grows the grids to 16 and 8.

Pages: [zh](https://zh.d2l.ai/chapter_computer-vision/anchor.html) and [en](https://d2l.ai/chapter_computer-vision/anchor.html).
